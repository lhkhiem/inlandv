import pool from './db'

async function checkAboutPage() {
  try {
    console.log('🔍 Checking about page data...\n')
    
    // Check page
    const pageResult = await pool.query(
      'SELECT * FROM pages WHERE slug = $1',
      ['gioi-thieu']
    )
    
    if (pageResult.rows.length === 0) {
      console.log('❌ Page not found!')
      return
    }
    
    console.log('✅ Page found:')
    console.log(JSON.stringify(pageResult.rows[0], null, 2))
    console.log('\n')
    
    // Check sections
    const sectionsResult = await pool.query(
      `SELECT * FROM page_sections 
       WHERE page_id = $1 
       ORDER BY display_order ASC`,
      [pageResult.rows[0].id]
    )
    
    console.log(`✅ Found ${sectionsResult.rows.length} sections:`)
    sectionsResult.rows.forEach((section, index) => {
      console.log(`\nSection ${index + 1}:`)
      console.log(`  Key: ${section.section_key}`)
      console.log(`  Name: ${section.name}`)
      console.log(`  Type: ${section.section_type}`)
      console.log(`  Published: ${section.published}`)
      console.log(`  Content length: ${section.content?.length || 0} chars`)
      console.log(`  Images: ${section.images?.length || 0} images`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkAboutPage()

















