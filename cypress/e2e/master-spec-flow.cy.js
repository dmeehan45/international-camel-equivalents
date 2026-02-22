describe('Master spec advisory flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes end-to-end docket creation with DBT contract text', () => {
    cy.contains('button', 'Begin Advisory Process').click();
    cy.contains('h2', 'Subject Profile');

    cy.contains('button', 'Proceed to Bid Library').click();
    cy.contains('Invalid Entry: Per DBT Statute 1.01, please enter a name.');

    cy.get('input[placeholder="e.g., Jordan Lee, collector of goblin gadgets"]').type('Layla Hassan');
    cy.get('select').first().select('United States');
    cy.contains('button', 'Proceed to Bid Library').click();

    cy.contains('h2', 'Select Bid Proxy & Amount (DBT v2.026)');
    cy.contains('Volatility Alert:');
    cy.contains('button', 'Browse Full DBT Library').click();
    cy.get('input[placeholder="Search proxies"]').type('Yaks');
    cy.contains('button', /^Yaks$/).click();
    cy.contains('button', 'Lock Advisory Bid').click();

    cy.contains('h2', 'Advisory Proposal Contract (Indenture Preview)');
    cy.get('.legal-shell-contract').should('exist');
    cy.get('textarea').invoke('val').should('contain', 'DOWRY PROPOSAL INDENTURE');
    cy.contains('button', 'Conclude & Access Docket').click();

    cy.contains('h2', 'Advisory Docket');
    cy.contains("Layla Hassan's Indenture");
    cy.contains('h3', 'Further Advisory Tools');
    cy.contains('New Advisory Tools Available');
    cy.contains('Proxy Personality Assessment');
  });
});
