import {
  expect,
  expectNoOptionalRuntime,
  guardBrowserNetwork,
  seedRejectedConsent,
  test,
} from './fixtures';

test('homepage service journey preselects contact and submits through the server action', async ({page}) => {
  await seedRejectedConsent(page);
  const network = await guardBrowserNetwork(page);

  await page.goto('/fr');
  await page.getByRole('main').getByRole('link', {name: /^IA & automatisation/}).click();
  await expect(page).toHaveURL(/\/fr\/services\/ai-automation$/);

  await page.getByRole('main').getByRole('link', {name: 'Me contacter', exact: true}).click();
  const dialog = page.getByRole('dialog', {name: 'Contact pour un projet IA ou 3D / XR'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox', {name: 'Type de projet'})).toHaveValue('ai');

  const form = dialog.locator('form');
  const name = dialog.getByRole('textbox', {name: 'Nom'});
  await dialog.getByRole('button', {name: 'Envoyer'}).click();
  await expect(name).toBeFocused();
  await expect.poll(() => name.evaluate((input: HTMLInputElement) => input.validationMessage)).not.toBe('');

  await form.evaluate((element: HTMLFormElement) => {
    element.noValidate = true;
  });
  await name.fill('A');
  await dialog.getByRole('textbox', {name: 'Email'}).fill('invalid');
  await dialog.getByRole('textbox', {name: 'Message'}).fill('court');
  await dialog.getByRole('button', {name: 'Envoyer'}).click();

  await expect(dialog.getByRole('alert')).toHaveText('Certains champs sont invalides.');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleName('Nom');
  const errorId = await name.getAttribute('aria-describedby');
  expect(errorId).toBeTruthy();
  await expect(dialog.locator(`[id="${errorId}"]`)).toHaveText(
    "Indiquez un nom d'au moins 2 caractères."
  );

  await name.fill('Ada Lovelace');
  await dialog.getByRole('textbox', {name: 'Email'}).fill('ada@example.test');
  await dialog.getByRole('textbox', {name: 'Message'}).fill(
    'Je souhaite automatiser ce processus répétitif avec une revue humaine.'
  );
  await dialog.getByRole('button', {name: 'Envoyer'}).click();

  await expect(dialog.getByRole('status')).toHaveText(
    'Message envoyé. Je reviens vers vous rapidement.'
  );
  await expectNoOptionalRuntime(page, network);
});

test('locale switching preserves contact query state and preselection', async ({page}) => {
  await seedRejectedConsent(page);
  const network = await guardBrowserNetwork(page);

  await page.goto('/fr/contact?service=ai&source=browser');
  await page.getByRole('link', {name: 'EN', exact: true}).click();

  await expect(page).toHaveURL(/\/en\/contact\?service=ai&source=browser$/);
  await expect(page.getByRole('combobox', {name: 'Project type'})).toHaveValue('ai');
  await expectNoOptionalRuntime(page, network);
});

test('locale links remain available without client JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();

  await page.goto('/fr/contact?service=ai');
  const englishLink = page.getByRole('link', {name: 'EN', exact: true});
  await expect(englishLink).toBeVisible();
  await expect(englishLink).toHaveAttribute('href', '/en/contact');

  await context.close();
});

test('mobile navigation and contact modal preserve keyboard focus', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await seedRejectedConsent(page);
  const network = await guardBrowserNetwork(page);

  await page.goto('/fr');
  const menuButton = page.locator('header button[aria-expanded]');
  await expect(menuButton).toHaveAccessibleName('Ouvrir le menu de navigation');
  await menuButton.focus();
  await page.keyboard.press('Enter');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  const menuId = await menuButton.getAttribute('aria-controls');
  expect(menuId).toBeTruthy();

  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(menuButton).toHaveAccessibleName('Ouvrir le menu de navigation');
  await expect(menuButton).toBeFocused();

  await page.keyboard.press('Enter');
  await page.locator(`[id="${menuId}"]`).getByRole('link', {name: 'Me contacter', exact: true}).click();
  const dialog = page.getByRole('dialog', {name: 'Contact pour un projet IA ou 3D / XR'});
  const closeButton = dialog.getByRole('button', {name: 'Fermer le formulaire de contact'});
  const submitButton = dialog.getByRole('button', {name: 'Envoyer'});
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(submitButton).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();
  await expectNoOptionalRuntime(page, network);
});
