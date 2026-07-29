// Regression coverage for the Page 5 advisory tools. Every "apply" action here
// used to write localStorage, show a confirmation, and change nothing.

function completeBidAndReachDocket() {
  cy.visit('/');
  cy.contains('button', 'Begin Advisory Process').click();
  cy.get('input[placeholder="e.g., Jordan Lee, collector of goblin gadgets"]').type('Layla Hassan');
  cy.get('select').first().select('United States');
  cy.contains('button', 'Proceed to Bid Library').click();
  cy.get('.proxy-cards button.card-button').first().click();
  cy.contains('button', 'Lock Advisory Bid').click();
  cy.contains('h2', 'Advisory Proposal Contract (Indenture Preview)');
  cy.contains('button', 'Conclude & Access Docket').click();
  cy.contains('h2', 'Advisory Docket');
}

describe('Page 5 advisory tools', () => {
  beforeEach(completeBidAndReachDocket);

  it('populates the archive ledger for every category in the picker', () => {
    cy.contains('button', 'Full DBT Archive').click();
    cy.get('.advisory-tool-shell select').first().find('option').then(($options) => {
      const labels = [...$options].map((o) => o.textContent);
      labels.forEach((label) => {
        cy.get('.advisory-tool-shell select').first().select(label);
        cy.get('.advisory-ledger-list .draft-card').should('have.length.greaterThan', 0);
        cy.contains('No historical records match this filter').should('not.exist');
      });
    });
  });

  it('applies a volatility forecast to the live bid', () => {
    cy.contains('button', 'Bid Volatility Simulator').click();
    cy.get('.advisory-tool-shell select').first().select(5);
    cy.get('.advisory-tool-shell select').first().find('option:selected').invoke('text').then((proxyName) => {
      cy.get('.advisory-tool-shell .cards button.card-button').first().click();
      cy.contains('button', 'Apply Forecast').click();

      // Lands on the bid it just changed, with the forecast surfaced there.
      cy.contains('h2', 'Select Bid Proxy & Amount (DBT v2.026)');
      cy.contains(`Selected Proxy: ${proxyName}`);
      cy.contains('Advisory outputs applied to this bid');
      cy.contains('Volatility Simulator:').should('contain', proxyName);
    });
  });

  it('lets the simulator be reset instead of stranding it at turn 4', () => {
    cy.contains('button', 'Bid Volatility Simulator').click();
    for (let i = 0; i < 4; i += 1) {
      cy.get('.advisory-tool-shell .cards button.card-button').first().click();
    }
    cy.contains('Simulation complete');
    cy.get('.advisory-tool-shell .cards button.card-button').first().should('be.disabled');

    cy.contains('button', 'Reset Simulation').click();
    cy.contains('Turn 1/4');
    cy.get('.advisory-tool-shell .cards button.card-button').first().should('not.be.disabled');
  });

  it('writes the contingency clause into the indenture addendum', () => {
    cy.contains('button', 'Maiden Response Estimator').click();
    cy.contains('button', 'Generate Contingency Clause').click();

    cy.contains('h2', 'Advisory Proposal Contract (Indenture Preview)');
    cy.get('.contract-text').should('contain', 'Contingency Protocol (Algorithm 5.13)');
    cy.get('.contract-text').should('contain', 'In event of rejection');
  });

  it('applies an archive trend to the live bid', () => {
    cy.contains('button', 'Full DBT Archive').click();
    cy.contains('button', 'Apply Trend to Bid').click();
    cy.contains('h2', 'Select Bid Proxy & Amount (DBT v2.026)');
    cy.contains('Advisory outputs applied to this bid');
    cy.contains('Historical Archive:');
  });

  it('confirms the quiz result was applied to the bid', () => {
    cy.contains('button', 'Proxy Personality Assessment').click();
    for (let i = 0; i < 6; i += 1) {
      cy.get('.advisory-tool-shell .cards button.card-button').first().click();
    }
    cy.contains('Assessment Complete');
    cy.contains('button', 'Apply to Next Bid').click();
    cy.contains('Spirit proxy applied to your bid');
  });

  it('clears advisory overlays on request', () => {
    cy.contains('button', 'Full DBT Archive').click();
    cy.contains('button', 'Apply Trend to Bid').click();
    cy.contains('Advisory outputs applied to this bid');
    cy.contains('button', 'Clear advisory overlays').click();
    cy.contains('Advisory outputs applied to this bid').should('not.exist');
  });
});

describe('Contract staleness', () => {
  beforeEach(completeBidAndReachDocket);

  it('flags the indenture when the bid changes underneath it, and regenerates on request', () => {
    cy.contains('button', 'Offer').click();
    cy.get('.proxy-cards button.card-button').eq(2).click();
    cy.get('.proxy-cards button.card-button').eq(2).invoke('text').then((label) => {
      const proxyName = label.trim().split('Benchmarked')[0].trim();
      cy.contains('button', 'Text').click();

      cy.contains('drawn against an earlier bid').should('be.visible');
      cy.contains('button', 'Regenerate Indenture').click();
      cy.contains('drawn against an earlier bid').should('not.exist');
      cy.get('.contract-text').should('contain', proxyName);
    });
  });
});
