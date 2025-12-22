/**
 * Fullpage Scroll - Integration Test
 * 
 * Tests scroll navigation, timeline interaction, and edge cases
 */

describe('Fullpage Scroll Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000) // Wait for page to load
  })

  it('should start at section 0 (Hero)', () => {
    cy.get('[id="section-0"]').should('be.visible')
    cy.get('[aria-current="true"]').contains('01')
  })

  it('should navigate to next section on wheel down', () => {
    // Simulate wheel down event
    cy.get('body').trigger('wheel', { deltaY: 100 })
    cy.wait(1000)
    
    // Should now be at section 1
    cy.get('[id="section-1"]').should('be.inViewport')
    cy.get('[aria-current="true"]').contains('02')
  })

  it('should navigate through all sections sequentially', () => {
    const sections = [0, 1, 2, 3, 4]
    
    sections.forEach((index) => {
      if (index > 0) {
        cy.get('body').trigger('wheel', { deltaY: 100 })
        cy.wait(1000)
      }
      
      cy.get(`[id="section-${index}"]`).should('be.inViewport')
      cy.get('[aria-current="true"]').contains(String(index + 1).padStart(2, '0'))
    })
  })

  it('should navigate using keyboard arrows', () => {
    // Arrow Down
    cy.get('body').type('{downarrow}')
    cy.wait(1000)
    cy.get('[id="section-1"]').should('be.inViewport')
    
    // Arrow Up
    cy.get('body').type('{uparrow}')
    cy.wait(1000)
    cy.get('[id="section-0"]').should('be.inViewport')
  })

  it('should navigate using Home/End keys', () => {
    // Press End to go to last section
    cy.get('body').type('{end}')
    cy.wait(1000)
    cy.get('[id="section-4"]').should('be.inViewport')
    
    // Press Home to go to first section
    cy.get('body').type('{home}')
    cy.wait(1000)
    cy.get('[id="section-0"]').should('be.inViewport')
  })

  it('should jump to section via timeline click', () => {
    // Click on section 3 in timeline
    cy.contains('[aria-label^="Go to"]', '03').click()
    cy.wait(1000)
    
    cy.get('[id="section-2"]').should('be.inViewport')
    cy.get('[aria-current="true"]').contains('03')
  })

  it('should show tooltip on timeline hover', () => {
    cy.get('[aria-label^="Go to"]').eq(1).trigger('mouseenter')
    cy.wait(200)
    
    // Should show tooltip with section title
    cy.contains('Giới thiệu').should('be.visible')
  })

  it('should show MouseScrollIcon on all sections except last', () => {
    // Should be visible on first section
    cy.get('[aria-label="Scroll to next section"]').should('be.visible')
    
    // Navigate to last section
    cy.get('body').type('{end}')
    cy.wait(1000)
    
    // Should be hidden on last section
    cy.get('[aria-label="Scroll to next section"]').should('not.exist')
  })

  it('should navigate on MouseScrollIcon click', () => {
    cy.get('[aria-label="Scroll to next section"]').click()
    cy.wait(1000)
    
    cy.get('[id="section-1"]').should('be.inViewport')
  })

  it('should prevent scroll spam (debounce)', () => {
    // Rapidly trigger wheel events
    cy.get('body')
      .trigger('wheel', { deltaY: 100 })
      .trigger('wheel', { deltaY: 100 })
      .trigger('wheel', { deltaY: 100 })
    
    cy.wait(1500)
    
    // Should only advance one or two sections, not skip to end
    cy.get('[id="section-0"], [id="section-1"], [id="section-2"]')
      .should('be.inViewport')
  })

  it('should not navigate beyond boundaries', () => {
    // At first section, wheel up should do nothing
    cy.get('body').trigger('wheel', { deltaY: -100 })
    cy.wait(1000)
    cy.get('[id="section-0"]').should('be.inViewport')
    
    // Go to last section
    cy.get('body').type('{end}')
    cy.wait(1000)
    
    // Wheel down should do nothing
    cy.get('body').trigger('wheel', { deltaY: 100 })
    cy.wait(1000)
    cy.get('[id="section-4"]').should('be.inViewport')
  })

  it('should handle window resize gracefully', () => {
    // Change viewport size
    cy.viewport(1280, 720)
    cy.wait(500)
    
    // Navigate should still work
    cy.get('body').trigger('wheel', { deltaY: 100 })
    cy.wait(1000)
    cy.get('[id="section-1"]').should('be.inViewport')
    
    // Resize to mobile
    cy.viewport(375, 667)
    cy.wait(500)
    
    // Timeline should be hidden on mobile
    cy.get('[aria-label="Section navigation"]').should('not.be.visible')
  })

  it('should support touch swipe on mobile', () => {
    cy.viewport('iphone-x')
    
    // Swipe up (scroll down)
    cy.get('body')
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 300 }] })
      .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 200 }] })
    
    cy.wait(1000)
    cy.get('[id="section-1"]').should('be.inViewport')
  })

  it('should maintain accessibility attributes', () => {
    // Check ARIA labels
    cy.get('[role="region"]').should('have.length', 5)
    cy.get('[aria-label="Section navigation"]').should('exist')
    
    // Check timeline buttons
    cy.get('[aria-label^="Go to"]').should('have.length', 5)
    
    // Check active indicator
    cy.get('[aria-current="true"]').should('exist')
  })
})

// Custom Cypress command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect()
  const windowHeight = Cypress.$(window).height()
  
  expect(rect.top).to.be.lessThan(windowHeight)
  expect(rect.bottom).to.be.greaterThan(0)
  
  return subject
})

declare global {
  namespace Cypress {
    interface Chainable {
      isInViewport(): Chainable<JQuery<HTMLElement>>
    }
  }
}

export {}
