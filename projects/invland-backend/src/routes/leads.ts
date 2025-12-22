import { Router } from 'express'
import { query } from '../database/db'
import { body, validationResult } from 'express-validator'

const router = Router()

// POST /api/leads - Create new lead (PUBLIC)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required')
      .matches(/^(0|\+84)[0-9]{9,10}$/).withMessage('Invalid phone number'),
    body('email').isEmail().withMessage('Invalid email'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('source').isIn(['homepage', 'project', 'contact']).withMessage('Invalid source'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { name, phone, email, message, source } = req.body

      const result = await query(
        'INSERT INTO leads (name, phone, email, message, source) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, phone, email, message, source]
      )

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Lead created successfully',
      })
    } catch (error) {
      console.error('Error creating lead:', error)
      res.status(500).json({ success: false, message: 'Failed to create lead' })
    }
  }
)

export default router

