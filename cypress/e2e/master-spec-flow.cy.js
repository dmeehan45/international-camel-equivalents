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
    cy.contains('button', 'Proceed to Bid Library').click();
    cy.contains('Invalid Entry: Per DBT Statute 1.02, please select a region.');

    cy.get('select').first().select('United States');
    cy.contains('button', 'Proceed to Bid Library').click();

    cy.contains('h2', 'Select Bid Proxy & Amount (DBT v2.026)');
    cy.contains('Volatility Alert:');

    // A proxy must be chosen before the bid can be locked.
    cy.contains('button', 'Lock Advisory Bid').click();
    cy.contains('h2', 'Select Bid Proxy & Amount (DBT v2.026)');

    cy.contains('button', 'Browse Full DBT Library').click();
    cy.get('input[placeholder="Search proxies"]').type('Yaks');
    cy.get('.proxy-library-list button.compare-select-button').first().click();
    cy.contains('Selected Proxy: Yaks');
    cy.contains('button', 'Lock Advisory Bid').click();

    cy.contains('h2', 'Advisory Proposal Contract (Indenture Preview)');
    cy.get('.contract-text').should('exist').and('contain', 'DOWRY PROPOSAL INDENTURE');
    cy.get('.contract-text').should('contain', 'Layla Hassan');
    cy.get('.contract-text').should('contain', 'Yaks');
    cy.contains('button', 'Conclude & Access Docket').click();

    cy.contains('h2', 'Advisory Docket');
    cy.contains("Layla Hassan's Indenture");
    cy.contains('Further Advisory Tools');
    cy.contains('Proxy Personality Assessment');
  });

  it('reports the same camel equivalent in the compare panel as on the offer summary', () => {
    cy.contains('button', 'Begin Advisory Process').click();
    cy.get('input[placeholder="e.g., Jordan Lee, collector of goblin gadgets"]').type('Layla Hassan');
    cy.get('select').first().select('United States');
    cy.contains('button', 'Proceed to Bid Library').click();

    cy.contains('button', 'Browse Full DBT Library').click();
    cy.get('.proxy-library-list input[type="checkbox"]').eq(0).check();
    cy.get('.proxy-library-list input[type="checkbox"]').eq(1).check();
    cy.get('.proxy-library-list button.compare-select-button').first().click();
    cy.contains('button', /^Compare Selected \(2\)$/).click();

    // The first compared proxy is also the selected one, so both readouts
    // describe the same bid and must agree.
    cy.get('.compare-col').first().contains('.helper', 'Camel Equivalent:')
      .invoke('text')
      .then((compareText) => {
        const compared = Number.parseFloat(compareText.replace(/[^0-9.]/g, ''));
        cy.contains('Current Benchmark:').invoke('text').then((summaryText) => {
          const summary = Number.parseFloat(summaryText.replace(/[^0-9.]/g, ''));
          // Both round to 2dp from the same division, so they must agree.
          expect(Math.abs(compared - summary)).to.be.lessThan(0.02);
        });
      });
  });
});
