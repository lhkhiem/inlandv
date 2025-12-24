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
    body('email')
      .custom((value, { req }) => {
        // Email is required for 'contact' source, optional for others
        if (req.body.source === 'contact') {
          if (!value || !value.trim()) {
            throw new Error('Email is required for contact form');
          }
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            throw new Error('Invalid email format');
          }
        } else if (value && value.trim()) {
          // If email is provided for other sources, validate format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            throw new Error('Invalid email format');
          }
        }
        return true;
      }),
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

      // Normalize email: required for contact source, optional for others
      const normalizedEmail = email && email.trim() ? email.trim() : ''

      const result = await query(
        'INSERT INTO leads (name, phone, email, message, source) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name.trim(), phone.trim(), normalizedEmail, message.trim(), source]
      )

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Lead created successfully',
      })
    } catch (error: any) {
      console.error('Error creating lead:', error)
      
      // Handle database constraint errors
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Duplicate entry' 
        })
      }
      
      // Handle other database errors
      if (error.code && error.code.startsWith('23')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid data provided' 
        })
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create lead',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
)

export default router

