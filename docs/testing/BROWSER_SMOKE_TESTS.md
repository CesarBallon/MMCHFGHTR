# Browser smoke tests

The browser smoke suite opens the checked-in public build in `dist/` and verifies the highest-risk player paths in Chromium:

- title-screen loading and canvas rendering;
- keyboard entry, fighter selection, and arcade combat input;
- two-player local-versus selection;
- standard-gamepad entry into fighter selection; and
- absence of uncaught JavaScript errors during boot.

Run the suite locally with:

```sh
npx playwright install chromium
npm run test:browser
```

GitHub Actions installs Chromium and runs this suite after the static, manifest, type, and unit validations. Failure artifacts include a screenshot, video, and Playwright trace.
