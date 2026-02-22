describe('Master spec flow', () => {
  beforeEach(() => {
    cy.visit('/phase1');
  });

  it('completes the happy path through all 4 phases', () => {
    cy.get('#phase1-bid-name').type('Layla');
    cy.get('#phase1-bid-region').select('gulf');
    cy.contains('button', 'Proceed to Valuation Hearing').click();

    cy.url().should('include', '/phase2');
    cy.contains('button', 'Affirm and Seal Bid').click();

    cy.url().should('include', '/phase3');
    cy.contains('button', 'Refresh draft').click();
    cy.contains('button', 'Continue to Phase IV docket').click();

    cy.url().should('include', '/phase4');
    cy.contains('button', 'Enter into Permanent Archive').should('be.enabled').click();
    cy.contains('Docket Queue');
  });

  it('supports browser back/forward without breaking gated progression', () => {
    cy.get('#phase1-bid-name').type('Nadia');
    cy.get('#phase1-bid-region').select('levant');
    cy.contains('button', 'Proceed to Valuation Hearing').click();
    cy.url().should('include', '/phase2');

    cy.go('back');
    cy.url().should('include', '/phase1');
    cy.go('forward');
    cy.url().should('include', '/phase2');
    cy.contains('Phase II: Valuation Hearing & Adjustment Review');
  });

  it('persists workflow draft after refresh and keeps user in current phase', () => {
    cy.get('#phase1-bid-name').type('Amina');
    cy.get('#phase1-bid-region').select('north_africa');
    cy.contains('button', 'Proceed to Valuation Hearing').click();
    cy.url().should('include', '/phase2');

    cy.reload();

    cy.url().should('include', '/phase2');
    cy.contains('Phase II: Valuation Hearing & Adjustment Review');
    cy.window().then((win) => {
      const raw = win.localStorage.getItem('ccc-workflow-draft-v1');
      expect(raw).to.not.equal(null);
    });
  });
});
