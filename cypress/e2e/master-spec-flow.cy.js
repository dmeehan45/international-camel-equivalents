describe('Master spec simplified flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes end-to-end draft creation with prefilled proposal text', () => {
    cy.contains('button', 'Begin Proposal').click();
    cy.contains('h2', 'Proposal For');

    cy.contains('button', 'Continue').click();
    cy.contains('Please enter a name.');

    cy.get('input[placeholder="e.g. Sarah Kim"]').type('Layla Hassan');
    cy.get('select').first().select('United States');
    cy.contains('button', 'Continue').click();

    cy.contains('h2', 'Your Dowry Offer');
    cy.contains('Equivalent in used compact cars').click();
    cy.contains('≈ 14 camels');
    cy.contains('button', 'Lock in this offer').click();

    cy.contains('h2', 'Your Proposal Text');
    cy.get('textarea').invoke('val').should('contain', 'I hereby formally propose marriage');
    cy.contains('button', 'Done – View my proposals').click();

    cy.contains('h2', 'Your Drafts');
    cy.contains('Layla Hassan');
    cy.contains('button', 'Extras').click();
    cy.contains('button', 'Generate polite rejection letter').click();
    cy.contains('Thank you for your proposal submission.');
    cy.contains('button', 'View past calculations').click();
    cy.contains('used compact cars');
  });
});
