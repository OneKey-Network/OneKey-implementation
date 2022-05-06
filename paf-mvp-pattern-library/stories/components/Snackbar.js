import Logo from './Logo';

export default (args) => {
  const title = args.title;

  return `<section class="ok-ui-snackbar">
    <main class="ok-ui-snackbar__body">
      <h1 class="ok-ui-heading-1">${title}</h1>
      <p>Turn <a href="#" class="ok-ui-link">personalized marketing</a> on at any time to make your ads more relevant.</p>
    </main>
    <footer class="ok-ui-snackbar__footer">
      ${Logo()}
    </footer>
  </section>`;
};