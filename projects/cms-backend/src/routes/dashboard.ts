import { Router } from 'express'
import { query } from '../database/db'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

// GET /api/dashboard/stats - Get dashboard statistics (ADMIN)
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    // Get counts
    const [projectsCount, postsCount, leadsCount, jobsCount] = await Promise.all([
      query('SELECT COUNT(*) FROM projects'),
      query('SELECT COUNT(*) FROM posts'),
      query('SELECT COUNT(*) FROM leads'),
      query('SELECT COUNT(*) FROM jobs'),
    ])

    // Get recent leads (last 7 days)
    const recentLeads = await query(
      `SELECT COUNT(*) FROM leads 
       WHERE created_at >= NOW() - INTERVAL '7 days'`
    )

    // Get projects by status
    const projectsByStatus = await query(
      `SELECT status, COUNT(*) as count 
       FROM projects 
       GROUP BY status`
    )

    res.json({
      success: true,
      data: {
        counts: {
          projects: parseInt(projectsCount.rows[0].count),
          posts: parseInt(postsCount.rows[0].count),
          leads: parseInt(leadsCount.rows[0].count),
          jobs: parseInt(jobsCount.rows[0].count),
        },
        recentLeads: parseInt(recentLeads.rows[0].count),
        projectsByStatus: projectsByStatus.rows,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' })
  }
})

export default router

