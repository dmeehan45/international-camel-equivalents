describe('Accessibility smoke checks', () => {
  beforeEach(() => {
    cy.visit('/phase1');
  });

  it('supports focus management for required phase 1 field', () => {
    cy.get('#phase1-bid-name').focus().should('be.focused');
  });

  it('supports keyboard-only progression from phase 1 to phase 2', () => {
    cy.get('#phase1-bid-name').type('Sara');
    cy.get('#phase1-bid-region').select('gulf');
    cy.contains('button', 'Proceed to Valuation Hearing').focus().type('{enter}');

    cy.url().should('include', '/phase2');
    cy.contains('Phase II: Valuation Hearing & Adjustment Review');
  });

  it('applies reduced-motion behavior via accessibility toggle', () => {
    cy.contains('summary', 'Accessibility').click();
    cy.contains('label', 'Reduced motion').find('input').check({ force: true });
    cy.get('#app-shell').should('have.class', 'reduced-motion-enabled');
  });
});
