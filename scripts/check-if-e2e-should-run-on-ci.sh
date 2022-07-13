# Since the e2e tests take a while to run and it could present an inconvenience
# to be making sure the e2e tests work on every single PR, only run the e2e tests on CI selectively.

# Run e2e tests on PRs to master
if [[ "$GITHUB_BASE_REF_SLUG" = "master" ]]; then
  echo "SHOULD_RUN_E2E=true" >> $GITHUB_ENV && export SHOULD_RUN_E2E=true
  echo 'Will run E2E tests because this is a PR to master'
elif [[ "$GITHUB_REPOSITORY" = "ibi-group/datatools-ui" ]]; then
  # Run e2e tests on pushes to dev and master (and for checkout branches from github actions too).
  if [[ "$GITHUB_REF_SLUG" = "master" || "$GITHUB_REF_SLUG" = "dev" || "$GITHUB_REF_SLUG" = "github-actions" ]]; then
    echo "SHOULD_RUN_E2E=true" >> $GITHUB_ENV && export SHOULD_RUN_E2E=true
    echo 'Will run E2E tests because this is a commit to master or dev'
  fi

  # The following is only for PR activity against dev (not push)
  if [[ "$GITHUB_BASE_REF_SLUG" = "dev" ]]; then
    # Also run e2e tests on automatic dependabot PR branches to dev to facilitate approval of security-related PRs.
    # We check that the branch ref starts with "dependabot/" (refs are in the format "dependabot/<module>/<package-version>").
    if [[ $GITHUB_HEAD_REF = dependabot/* ]]; then
      if [[ "$GITHUB_EVENT_NAME" = "pull_request" ]]; then
        echo "SHOULD_RUN_E2E=true" >> $GITHUB_ENV && export SHOULD_RUN_E2E=true
        echo 'Will run E2E tests because this is an automatic dependabot PR to dev'
      fi
    # On non-dependabot PRs, also run e2e tests after a pull request approval or when updating an approved a pull request.
    # This is to limit the number of e2e runs while ensuring e2e tests pass before merging.
    elif [[ "$PR_REVIEW_DECISION" = "approved" ]]; then
      echo "SHOULD_RUN_E2E=true" >> $GITHUB_ENV && export SHOULD_RUN_E2E=true
      echo 'Will run E2E tests because this PR has been approved'
    fi
  fi
fi

if [[ "$SHOULD_RUN_E2E" != "true" ]]; then
  echo 'Skipping E2E tests...'
fi

# Optionally override the conditions above with the below block:
# OVERRIDE=true
# echo "SHOULD_RUN_E2E=${OVERRIDE}" >> $GITHUB_ENV && export SHOULD_RUN_E2E=${OVERRIDE}
# echo "Overriding E2E. Temporarily forcing to be ${OVERRIDE}..."
