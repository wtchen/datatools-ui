if [[ "$TRAVIS_PULL_REQUEST" = "true" ]]; then
  if [[ "$TRAVIS_PULL_REQUEST_SLUG" = "conveyal/datatools-ui" ]]; then
    export SHOULD_RUN_E2E=true;
  fi
else
  if [[ "$TRAVIS_REPO_SLUG" = "conveyal/datatools-ui" ]] && [[ "$TRAVIS_BRANCH" = "master" || "$TRAVIS_BRANCH" = "dev" ]]; then
    export SHOULD_RUN_E2E=true;
  fi
fi

# temporarily set SHOULD_RUN_E2E to true on PR for e2e branch
# remove this just before merging to dev
export SHOULD_RUN_E2E=true;
