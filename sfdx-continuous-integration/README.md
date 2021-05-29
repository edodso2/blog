---
path: "sfdx-continuous-integration"
title: "SFDX Continuous Integration"
description: "A simple CI workflow using GitHub actions to run Apex and LWC tests"
date: "May 29, 2021"
category: "DevOps"
---

# SFDX Continuous Integration

In this post we will setup a CI (continuous integration) workflow that automatically runs our Apex and LWC unit tests on each code push. We will use GitHub actions to run the workflow.

## Prerequisites

1. An SFDX project
2. A GitHub repository with the SFDX project
3. A DevHub Org for creating scratch orgs

If you do not have the above you can fork/clone the project located [here](https://github.com/edodso2/blog/tree/master/apex-auraenabled-unit-tests).

> It is recommended that you have unit tests to get the most out of the CI workflow; however, You can still benefit from the workflow without any unit tests since it will at least verify your code can be pushed into a scratch org without errors.

## Repository Setup

First we need to add a secret to the github repository to give the GitHub CI workflow access to your DevHub.

1. Run `sfdx force:org:display --verbose -u <dev_hub_username>` in you terminal window
2. Copy the **Sfdx Auth Url** value
3. In your GitHub repository you want to add CI to click **Settings** 
4. Click **Secrets**
5. Click **New**<br>
    Name: **DEVHUB_SFDX_URL**
    Value: Use the **Sfdx Auth Url** value

## Workflow Setup

1. Create the following folder structure in the root of your SFDX project: `.github/workflows`

2. Create a new file in the newly created workflow folder called `deploy-and-test.yml`. The name of this file can be whatever best describes the workflow.

3. Add the following contents to the `deploy-and-test.yml` file.

```YML
# Unique name for this workflow
name: Run Unit Tests

# Workflow starts when receiving custom event sent by CI workflow
on: [push, pull_request]

# Jobs to be executed
jobs:
  deploy-and-test:
    runs-on: ubuntu-latest

    steps:
      # Setup Node (for LWC tests)
      - name: Setup NPM
        uses: actions/setup-node@v1
        with:
          node-version: 12.x

      # Install Salesforce CLI
      - name: "Install Salesforce CLI"
        run: |
          wget https://developer.salesforce.com/media/salesforce-cli/sfdx/channels/stable/sfdx-linux-x64.tar.xz
          mkdir ~/sfdx
          tar xJf sfdx-linux-x64.tar.xz -C ~/sfdx --strip-components 1
          echo "$HOME/sfdx/bin" >> $GITHUB_PATH
          ~/sfdx/bin/sfdx version

      # Checkout the source code
      - name: "Checkout source code"
        uses: actions/checkout@v2

      # Store secret for dev hub
      - name: "Populate auth file with DEVHUB_SFDX_URL secret"
        shell: bash
        run: echo ${{ secrets.DEVHUB_SFDX_URL}} > ./DEVHUB_SFDX_URL.txt

      # Authenticate dev hub
      - name: "Authenticate Dev Hub"
        run: sfdx auth:sfdxurl:store -f ./DEVHUB_SFDX_URL.txt -a devhub -d

      # Remove auth file
      - name: "Remove auth file"
        run: rm -f ./DEVHUB_SFDX_URL.txt

      # Create scratch org
      - name: "Create scratch org"
        run: sfdx force:org:create -f config/project-scratch-def.json -a scratch-org -s -d 1

      # Push source to scratch org
      - name: "Push source to scratch org"
        run: sfdx force:source:push

      # Run Apex tests
      - name: "Run apex tests"
        run: sfdx force:apex:test:run -w 5

      # Run LWC tests
      - name: "Run LWC tests"
        run: |
          npm install
          npm test
        env:
          CI: true
      
      # Housekeeping
      - name: "Delete scratch org"
        if: always()
        run: sfdx force:org:delete -p -u scratch-org

```

The steps of this workflow are as follows:

1. Install Salesforce CLI & Node.js
2. Checkout source code
3. Store DevHub Auth URL (this is the auth url we created earlier) in a .txt file
4. Authenticate the Dev Hub using the .txt file
5. Delete the .txt file (for security purposes)
6. Create a scratch org
7. Push source to the scratch org
8. Run apex tests
9. Run LWC tests
9. Delete the scratch org

> Note that in this workflow we deploy the source directly to the scratch org. You might want to create a package instead and install that in the org. The [LWC-Recipes](https://github.com/trailheadapps/lwc-recipes/tree/main/.github/workflows) repository has an example of how to do that.

## Closing Notes

The CI setup is now complete. One issue I have found with this setup is that the Apex test results cannot be viewed in the GitHub actions log. Hopefully, I can make a post in the future about how to easily view the Apex log output.
