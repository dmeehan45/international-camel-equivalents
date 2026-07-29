describe('Mobile responsive behavior', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/');
  });

  function completeIntake() {
    cy.contains('button', 'Begin Advisory Process').click();
    cy.get('input[placeholder="e.g., Jordan Lee, collector of goblin gadgets"]').type('Layla Hassan');
    cy.get('select').first().select('United States');
    cy.contains('button', 'Proceed to Bid Library').click();
  }

  it('keeps layout single column and supports full-screen library drawer', () => {
    cy.get('.app-shell').should('have.css', 'padding-left', '16px');
    completeIntake();

    cy.get('input[type="range"]').should('be.visible');
    cy.contains('button', 'Browse Full DBT Library').click();
    cy.get('.drawer--library').should('be.visible');
    cy.contains('button', 'Close library').click();
    cy.get('.drawer--library').should('not.exist');
  });

  it('keeps proposal preview visible with mobile viewport sizing', () => {
    completeIntake();

    cy.get('.proxy-cards button.card-button').first().click();
    cy.contains('button', 'Lock Advisory Bid').click();

    cy.contains('h2', 'Advisory Proposal Contract (Indenture Preview)');
    cy.get('.contract-text').should('be.visible').and(($el) => {
      const height = Number.parseFloat($el.css('max-height'));
      expect(height).to.be.greaterThan(200);
    });
  });

  it('never scrolls horizontally on any step of the flow', () => {
    const assertNoOverflow = () => {
      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth + 1);
      });
    };

    assertNoOverflow();
    completeIntake();
    assertNoOverflow();

    cy.get('.proxy-cards button.card-button').first().click();
    cy.contains('button', 'Lock Advisory Bid').click();
    cy.contains('h2', 'Advisory Proposal Contract (Indenture Preview)');
    assertNoOverflow();

    cy.contains('button', 'Conclude & Access Docket').click();
    cy.contains('h2', 'Advisory Docket');
    assertNoOverflow();
  });
});
