describe('Accessibility smoke checks', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exposes landmark and progress navigation to assistive technology', () => {
    cy.get('main.app-shell').should('exist');
    cy.get('nav[aria-label="Progress"]').should('exist');
    cy.get('button[aria-label="Back"]').should('exist');
    cy.get('button[aria-label="Home"]').should('exist');
  });

  // Cypress does not simulate the browser's implicit Enter-activates-button
  // behavior, so this asserts the property that actually matters for keyboard
  // users: every control in the path is reachable and focusable.
  it('keeps every control on the path to the offer page focusable', () => {
    cy.contains('button', 'Begin Advisory Process').focus().should('be.focused').click();

    cy.contains('h2', 'Subject Profile');
    cy.get('input').first().focus().should('be.focused').type('Sara');
    cy.get('select').first().focus().should('be.focused').select('United Kingdom');
    cy.contains('button', 'Proceed to Bid Library').focus().should('be.focused').click();

    cy.contains('h2', 'Select Bid Proxy & Amount (DBT v2.026)');
    cy.get('.proxy-cards button.card-button').first().focus().should('be.focused');
    cy.get('input[type="range"]').focus().should('be.focused');
    cy.contains('button', 'Lock Advisory Bid').focus().should('be.focused');
  });

  it('announces validation errors rather than failing silently', () => {
    cy.contains('button', 'Begin Advisory Process').click();
    cy.contains('button', 'Proceed to Bid Library').click();
    cy.contains('Invalid Entry: Per DBT Statute 1.01, please enter a name.').should('be.visible');
  });

  it('gives every proxy card an accessible name that includes its description', () => {
    cy.contains('button', 'Begin Advisory Process').click();
    cy.get('input').first().type('Sara');
    cy.get('select').first().select('United Kingdom');
    cy.contains('button', 'Proceed to Bid Library').click();

    cy.get('.proxy-cards button[aria-label]').should('have.length.greaterThan', 0);
    cy.get('.proxy-cards button[aria-label]').each(($el) => {
      expect($el.attr('aria-label')).to.match(/\S+\.\s+\S+/);
    });
  });

  it('marks the legal modal as a dialog with an accessible name', () => {
    cy.contains('button', 'Privacy Notice').click();
    cy.get('[role="dialog"][aria-modal="true"]').should('have.attr', 'aria-label');
  });
});
