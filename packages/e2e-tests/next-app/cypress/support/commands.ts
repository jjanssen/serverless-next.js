// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Declare command definitions here so that autocomplete works
declare namespace Cypress {
  interface Chainable {
    ensureRouteCached: (path: string | RegExp) => Cypress.Chainable<JQuery>;
    ensureRouteNotCached: (path: string | RegExp) => Cypress.Chainable<JQuery>;
    ensureRouteNotErrored: (path: string | RegExp) => Cypress.Chainable<JQuery>;
    ensureAllRoutesNotErrored: () => Cypress.Chainable<JQuery>;
    ensureRouteHasStatusCode: (
      path: string | RegExp,
      status: number
    ) => Cypress.Chainable<JQuery>;
    verifyPermanentRedirect: (
      path: string,
      redirectedPath: string
    ) => Cypress.Chainable<JQuery>;
    verifyResponseCacheStatus: (
      response: Cypress.Response,
      shouldBeCached: boolean
    ) => Cypress.Chainable<JQuery>;
  }
}

Cypress.Commands.add("ensureAllRoutesNotErrored", () => {
  cy.route2("**", (req) => {
    req.reply((res) => {
      if (res.statusCode >= 400) {
        throw new Error(`Response has errored with status ${res.statusCode}`);
      }
    });
  });
});

Cypress.Commands.add("ensureRouteNotCached", (path: string | RegExp) => {
  cy.route2(path, (req) => {
    req.reply((res) => {
      if (res.statusCode >= 400) {
        throw new Error(`Response has errored with status ${res.statusCode}`);
      }

      if (res.headers["x-cache"] === "Hit from cloudfront") {
        throw new Error("Response was unexpectedly cached in CloudFront.");
      }
    });
  });
});

Cypress.Commands.add("ensureRouteCached", (path: string | RegExp) => {
  cy.route2(path, (req) => {
    req.reply((res) => {
      if (res.statusCode >= 400) {
        throw new Error(`Response has errored with status ${res.statusCode}`);
      }

      if (res.headers["x-cache"] !== "Hit from cloudfront") {
        throw new Error("Response was unexpectedly uncached in CloudFront.");
      }
    });
  });
});

Cypress.Commands.add("ensureRouteNotErrored", (path: string | RegExp) => {
  cy.route2(path, (req) => {
    req.reply((res) => {
      if (res.statusCode >= 400) {
        throw new Error(`Response has errored with status ${res.statusCode}`);
      }
    });
  });
});

Cypress.Commands.add(
  "ensureRouteHasStatusCode",
  (path: string | RegExp, status: number) => {
    cy.route2(path, (req) => {
      req.reply((res) => {
        if (res.statusCode !== status) {
          throw new Error(
            `Page did not return expected status code of ${status}. Instead it returned ${res.statusCode}`
          );
        }
      });
    });
  }
);

Cypress.Commands.add(
  "verifyPermanentRedirect",
  (path: string, redirectedPath: string) => {
    cy.request({ url: path, followRedirect: false }).then((response) => {
      expect(response.status).to.equal(308);
      expect(response.headers["location"]).to.equal(redirectedPath);
      expect(response.headers["refresh"]).to.equal(`0;url=${redirectedPath}`);
    });
  }
);

Cypress.Commands.add(
  "verifyResponseCacheStatus",
  (response: Cypress.Response, shouldBeCached: boolean) => {
    if (shouldBeCached) {
      expect(response.headers["x-cache"]).to.equal("Hit from cloudfront");
    } else {
      expect(response.headers["x-cache"]).to.be.oneOf([
        "Miss from cloudfront",
        "LambdaGeneratedResponse from cloudfront"
      ]);
    }
  }
);
