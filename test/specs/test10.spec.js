// Import statements only - no executable code at module level
import assert from "assert";
import { expect } from "chai";
import { promises as fs } from "fs";
import extractVerbData2 from "./extractData.js";

// Test suite - all browser code inside functions
describe("Base de données du Conjugueur de la langue amazighe V2", function () {
  // Before hook to ensure browser is ready
  before(async function () {
    this.timeout(120000); // 2 minutes for setup
    try {
      await browser.maximizeWindow();
      console.log("Browser initialized successfully");

      // Set page load timeout
      await browser.setTimeout({ pageLoad: 60000 });

      // Test basic browser functionality
      await browser.url(
        "data:text/html,<html><body><h1>Test</h1></body></html>",
      );
      console.log("✅ Basic browser navigation working");
    } catch (error) {
      console.error("Browser setup failed:", error.message);
      throw error;
    }
  });

  it("write the verb in text field", async function () {
    // Set a very long timeout for this test
    this.timeout(86400000000); // 10 hours * 100

    try {
      console.log("=".repeat(50));
      console.log("STARTING AMAZIGH CONJUGATOR TEST - BATCH PROCESSING");
      console.log("=".repeat(50));

      // Step 1: Navigate to the website with multiple attempts
      console.log("Step 1: Navigating to conjugation website...");

      let navigationSuccess = false;
      const maxNavigationAttempts = 3;

      for (let attempt = 1; attempt <= maxNavigationAttempts; attempt++) {
        try {
          console.log(
            `Navigation attempt ${attempt}/${maxNavigationAttempts}...`,
          );

          await browser.url("https://tal2.ircam.ma/conjugueur/conjugappl.php");

          // Wait for any content to load (more lenient check)
          await browser.waitUntil(
            async () => {
              try {
                const body = await $("body");
                const bodyText = await body.getText();
                return bodyText && bodyText.length > 0;
              } catch {
                return false;
              }
            },
            {
              timeout: 30000,
              timeoutMsg: `Page body did not load on attempt ${attempt}`,
              interval: 5000,
            },
          );

          console.log(`✅ Basic page content loaded on attempt ${attempt}`);
          navigationSuccess = true;
          break;
        } catch (error) {
          console.log(
            `❌ Navigation attempt ${attempt} failed: ${error.message}`,
          );
          if (attempt < maxNavigationAttempts) {
            await browser.pause(5000); // Wait before retry
          }
        }
      }

      if (!navigationSuccess) {
        throw new Error(
          "Failed to navigate to the website after multiple attempts",
        );
      }

      // Step 2: Wait for form elements
      console.log("Step 2: Waiting for form elements...");

      // Helper function for safe element finding
      const findElement = async (selectors, elementName, timeout = 30000) => {
        const selectorsToTry = Array.isArray(selectors)
          ? selectors
          : [selectors];

        for (const selector of selectorsToTry) {
          try {
            console.log(`Trying ${elementName} selector: ${selector}`);
            const element = await $(selector);
            await element.waitForDisplayed({
              timeout: timeout / selectorsToTry.length,
            });
            console.log(`✅ Found ${elementName} with selector: ${selector}`);
            return { element, selector };
          } catch (error) {
            console.log(
              `❌ ${elementName} selector "${selector}" failed: ${error.message}`,
            );
          }
        }
        throw new Error(`Could not find ${elementName} with any selector`);
      };

      // Try multiple selectors for text field and submit button
      const textFieldSelectors = [
        "#textfield",
        'input[type="text"]',
        'input[name*="text"]',
        "input",
        "textarea",
      ];

      const submitButtonSelectors = [
        "#boton",
        'input[type="submit"]',
        'button[type="submit"]',
        "button",
        'input[value*="conjuguer" i]',
      ];

      let textFieldResult, submitButtonResult;

      try {
        textFieldResult = await findElement(
          textFieldSelectors,
          "text field",
          60000,
        );
        submitButtonResult = await findElement(
          submitButtonSelectors,
          "submit button",
          60000,
        );
      } catch (error) {
        console.log(
          "Could not find required form elements. Taking screenshot...",
        );
        try {
          await browser.saveScreenshot("./debug_screenshot.png");
          console.log("Screenshot saved as debug_screenshot.png");
        } catch (screenshotError) {
          console.log("Could not take screenshot:", screenshotError.message);
        }
        throw new Error(`Form elements not found: ${error.message}`);
      }

      console.log("✅ All required form elements found");

      // Step 3: Get CSV data
      console.log("Step 3: Loading verb data...");
      let csvData;

      try {
        const possiblePaths = [
          "./test/specs/verbs_list.csv",
          "./verbs_list.csv",
          "test/specs/verbs_list.csv",
          "verbs_list.csv",
        ];

        let csvContent = null;

        for (const path of possiblePaths) {
          try {
            csvContent = await fs.readFile(path, "utf8");
            console.log(`✅ Found CSV file at: ${path}`);
            break;
          } catch (err) {
            continue;
          }
        }

        if (csvContent) {
          csvData = csvContent;
        } else {
          throw new Error("CSV file not found in any expected location");
        }
      } catch (error) {
        console.error("Error loading data:", error.message);
        throw new Error(`Could not load verb data: ${error.message}`);
      }

      // Step 4: Parse CSV data
      const rows = csvData.split("\n").slice(1);
      const validRows = rows.filter(
        (row) => row.trim() !== "" && row.includes(","),
      );
      console.log(`Found ${validRows.length} verbs to process`);

      if (validRows.length === 0) {
        throw new Error("No valid verbs found in CSV file");
      }

      // Step 5: Process verbs in batches
      const BATCH_SIZE = 100;
      const totalVerbs = validRows.length;
      const totalBatches = Math.ceil(totalVerbs / BATCH_SIZE);

      console.log(`\n${"=".repeat(50)}`);
      console.log(`BATCH PROCESSING CONFIGURATION:`);
      console.log(`Total verbs: ${totalVerbs}`);
      console.log(`Batch size: ${BATCH_SIZE}`);
      console.log(`Total batches: ${totalBatches}`);
      console.log(`${"=".repeat(50)}\n`);

      const allResults = [];
      const allFailures = [];

      // Helper function for safe text extraction
      const getTextSafely = async (selector, fieldName = "field") => {
        try {
          const element = await $(selector);

          if (!(await element.isExisting())) {
            console.log(`    ⚠️ ${fieldName} not found`);
            return "";
          }

          if (!(await element.isDisplayed())) {
            console.log(`    ⚠️ ${fieldName} not displayed`);
            return "";
          }

          const text = await element.getText();
          if (text && text.trim()) {
            console.log(
              `    ✅ ${fieldName}: "${text.trim().substring(0, 30)}..."`,
            );
            return text.trim();
          } else {
            console.log(`    ⚠️ ${fieldName} is empty`);
            return "";
          }
        } catch (error) {
          console.log(`    ❌ ${fieldName} error: ${error.message}`);
          return "";
        }
      };

      // Helper function to extract all verb data
      const extractVerbData = async (verbName, verbTypeValue, labelType) => {
        const data = {
          name: verbName,
          inputType: verbTypeValue,
          labelType: labelType || "default",
          timestamp: new Date().toISOString(),
          processed: true,
        };

        // Extract translations
        data.ar = await getTextSafely(
          '//*[@id="list"]/table/tbody/tr/td[2]/div',
          "Arabic translation",
        );
        data.fr = await getTextSafely(
          '//*[@id="list"]/table/tbody/tr/td[1]/div',
          "French translation",
        );

        // Extract all conjugation forms
        data.ao = {
          s1: {
            m: await getTextSafely(
              //"//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[1]/table[1]/tbody[1]/tr[3]/td[3]",
              '//*[@id="list"]/li[1]/table/tbody/tr[3]/td[3]',
              "AO s1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[3]/td[4]',
              "AO s1 f",
            ),
          },
          s2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[4]/td[2]',
              "AO s2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[4]/td[3]',
              "AO s2 f",
            ),
          },
          s3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[5]/td[2]',
              "AO s3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[5]/td[3]',
              "AO s3 f",
            ),
          },
          p1: {
            m: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[6]/td[3]',
              "AO p1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[6]/td[4]',
              "AO p1 f",
            ),
          },
          p2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[7]/td[2]',
              "AO p2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[7]/td[3]',
              "AO p2 f",
            ),
          },
          p3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[8]/td[2]',
              "AO p3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[1]/table/tbody/tr[8]/td[3]',
              "AO p3 f",
            ),
          },
        };

        data.acc = {
          s1: {
            m: await getTextSafely(
              "//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[2]/div[1]/ul[2]/li[2]/table[1]/tbody[1]/tr[3]/td[3]",
              //'//*[@id="list"]/li[2]/table/tbody/tr[3]/td[3]',
              "ACC s1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[3]/td[4]',
              "ACC s1 f",
            ),
          },
          s2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[4]/td[2]',
              "ACC s2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[4]/td[3]',
              "ACC s2 f",
            ),
          },
          s3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[5]/td[2]',
              "ACC s3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[5]/td[3]',
              "ACC s3 f",
            ),
          },
          p1: {
            m: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[6]/td[3]',
              "ACC p1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[6]/td[4]',
              "ACC p1 f",
            ),
          },
          p2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[7]/td[2]',
              "ACC p2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[7]/td[3]',
              "ACC p2 f",
            ),
          },
          p3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[8]/td[2]',
              "ACC p3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[2]/table/tbody/tr[8]/td[3]',
              "ACC p3 f",
            ),
          },
        };

        data.accn = {
          s1: {
            m: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[3]/td[3]',
              "ACCN s1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[3]/td[4]',
              "ACCN s1 f",
            ),
          },
          s2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[4]/td[2]',
              "ACCN s2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[4]/td[3]',
              "ACCN s2 f",
            ),
          },
          s3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[5]/td[2]',
              "ACCN s3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[5]/td[3]',
              "ACCN s3 f",
            ),
          },
          p1: {
            m: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[6]/td[3]',
              "ACCN p1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[6]/td[4]',
              "ACCN p1 f",
            ),
          },
          p2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[7]/td[2]',
              "ACCN p2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[7]/td[3]',
              "ACCN p2 f",
            ),
          },
          p3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[8]/td[2]',
              "ACCN p3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[3]/table/tbody/tr[8]/td[3]',
              "ACCN p3 f",
            ),
          },
        };

        data.inacc = {
          s1: {
            m: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[3]/td[3]',
              "INACC s1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[3]/td[4]',
              "INACC s1 f",
            ),
          },
          s2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[4]/td[2]',
              "INACC s2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[4]/td[3]',
              "INACC s2 f",
            ),
          },
          s3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[5]/td[2]',
              "INACC s3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[5]/td[3]',
              "INACC s3 f",
            ),
          },
          p1: {
            m: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[6]/td[3]',
              "INACC p1 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[6]/td[4]',
              "INACC p1 f",
            ),
          },
          p2: {
            m: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[7]/td[2]',
              "INACC p2 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[7]/td[3]',
              "INACC p2 f",
            ),
          },
          p3: {
            m: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[8]/td[2]',
              "INACC p3 m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[4]/table/tbody/tr[8]/td[3]',
              "INACC p3 f",
            ),
          },
        };

        data.imp = {
          s: {
            m: await getTextSafely(
              '//*[@id="list"]/li[5]/table/tbody/tr[3]/td[2]',
              "IMP s m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[5]/table/tbody/tr[3]/td[3]',
              "IMP s f",
            ),
          },
          p: {
            m1: await getTextSafely(
              '//*[@id="list"]/li[5]/table/tbody/tr[4]/td[2]',
              "IMP p m1",
            ),
            m2: await getTextSafely(
              '//*[@id="list"]/li[5]/table/tbody/tr[4]/td[2]',
              "IMP p m2",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[5]/table/tbody/tr[4]/td[3]',
              "IMP p f",
            ),
          },
        };

        data.impi = {
          s: {
            m: await getTextSafely(
              '//*[@id="list"]/li[6]/table/tbody/tr[3]/td[2]',
              "IMPI s m",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[6]/table/tbody/tr[3]/td[3]',
              "IMPI s f",
            ),
          },
          p: {
            m1: await getTextSafely(
              '//*[@id="list"]/li[6]/table/tbody/tr[4]/td[2]',
              //'//body[1]/table[1]/tbody[1]/tr[6]/td[1]/table[1]/tbody[1]/tr[2]/td[2]/div[1]/div[1]/div[1]/div[1]/ul[2]/li[6]/table[1]/tbody[1]/tr[4]/td[2]',
              "IMPI p m1",
            ),
            m2: await getTextSafely(
              '//*[@id="list"]/li[6]/table/tbody/tr[4]/td[2]',
              //'//*[@id="list"]/li[6]/table/tbody/tr[4]/td[2]/table/tbody/tr[2]/td',
              "IMPI p m2",
            ),
            f: await getTextSafely(
              '//*[@id="list"]/li[6]/table/tbody/tr[4]/td[3]',
              "IMPI p f",
            ),
          },
        };

        return data;
      };

      // Process each batch
      for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        const batchStart = batchNum * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, totalVerbs);
        const batchRows = validRows.slice(batchStart, batchEnd);

        console.log(`\n${"=".repeat(50)}`);
        console.log(`BATCH ${batchNum + 1}/${totalBatches}`);
        console.log(`Processing verbs ${batchStart + 1} to ${batchEnd}`);
        console.log(`${"=".repeat(50)}\n`);

        const batchResults = [];
        const batchFailures = [];

        for (let i = 0; i < batchRows.length; i++) {
          const globalIndex = batchStart + i;
          const row = batchRows[i];
          const columns = row.split(",");

          const verb = columns[0]?.trim() || "";
          const verbType = columns[1]?.trim() || "";

          if (!verb) {
            console.log(`Skipping empty verb at position ${globalIndex + 1}`);
            continue;
          }

          console.log(
            `\n[${globalIndex + 1}/${totalVerbs}] [Batch ${batchNum + 1}, Item ${i + 1}/${batchRows.length}] Processing: "${verb}" (Type: ${verbType})`,
          );

          try {
            // Clear and enter verb
            await textFieldResult.element.clearValue();
            await browser.pause(1000);

            await textFieldResult.element.setValue(verb);
            await browser.pause(1000);

            // Submit the form
            await submitButtonResult.element.click();

            // Wait for results with generous timeout
            let resultsFound = false;
            let isErrorPage = false;

            try {
              await browser.waitUntil(
                async () => {
                  try {
                    // Check for error message first
                    const errorSelectors = [
                      "//text()[contains(.,'الفعل غير موجود')]",
                      "//text()[contains(.,'le verbe')]",
                      "//*[contains(text(),'غير')]",
                    ];

                    for (const errorSel of errorSelectors) {
                      try {
                        const errorEl = await $(errorSel);
                        if (await errorEl.isExisting()) {
                          isErrorPage = true;
                          return true; // Exit wait - we found something
                        }
                      } catch {}
                    }

                    // Check for actual results
                    const possibleResultSelectors = ["#list", "#envelop"];

                    for (const selector of possibleResultSelectors) {
                      try {
                        const element = await $(selector);
                        if (
                          (await element.isExisting()) &&
                          (await element.isDisplayed())
                        ) {
                          const text = await element.getText();
                          if (text && text.trim().length > 10) {
                            return true;
                          }
                        }
                      } catch {}
                    }
                    return false;
                  } catch {
                    return false;
                  }
                },
                {
                  timeout: 45000,
                  timeoutMsg: `Results did not appear for verb: ${verb}`,
                  interval: 2000,
                },
              );

              if (!isErrorPage) {
                resultsFound = true;
              }
            } catch (waitError) {
              console.log(`  ❌ Timeout waiting for results`);
            }

            // Check if we got an error page
            if (isErrorPage) {
              console.log(`  ⚠️ Verb not found in database: ${verb}`);
              throw new Error(`Verb not recognized by the conjugator: ${verb}`);
            }

            if (resultsFound) {
              console.log(`  ✅ Results found, checking for label sections...`);

              // Check which labels exist
              const labelXPaths = [
                "//label[contains(text(),'ⴰⵙⴼⵜⵉ 1')]",
                "//label[contains(text(),'ⴰⵙⴼⵜⵉ 2')]",
                "//label[contains(text(),'ⴰⵙⴼⵜⵉ 3')]",
              ];

              const existingLabels = [];
              for (const xpath of labelXPaths) {
                try {
                  const labelElement = await $(xpath);
                  if (await labelElement.isExisting()) {
                    existingLabels.push({
                      xpath,
                      element: labelElement,
                      name: xpath.includes("1")
                        ? "ⴰⵙⴼⵜⵉ 1"
                        : xpath.includes("2")
                          ? "ⴰⵙⴼⵜⵉ 2"
                          : "ⴰⵙⴼⵜⵉ 3",
                    });
                  }
                } catch (error) {
                  // Label not found, continue
                }
              }

              console.log(
                `  📋 Found ${existingLabels.length} label section(s)`,
              );

              // If no labels, process once with default data
              if (existingLabels.length === 0) {
                console.log(`  📊 Extracting data (no label sections)...`);

                const verbData = await extractVerbData(verb, verbType, null);
                batchResults.push(verbData);
                allResults.push(verbData);
                console.log(`  ✅ Successfully processed: ${verb}`);
              } else {
                // IMPORTANT: Label 1 is expanded by default, Label 2 is collapsed by default
                // We need to:
                // 1. Extract Label 1 data first (it's already expanded)
                // 2. Collapse Label 1 explicitly
                // 3. Expand Label 2
                // 4. Extract Label 2 data

                //Expand Label1

                // Process Label 1 FIRST (it's already expanded by default)
                if (existingLabels.length >= 1) {
                  const label1 = existingLabels[0];
                  await label1.element.click();
                  console.log(
                    `\n  📂 Processing section: ${label1.name} (default expanded)`,
                  );

                  // Take screenshot
                  try {
                    const screenshotName = `./debug_verb_${verb.replace(/[^a-zA-Z0-9]/g, "_")}_${label1.name.replace(/\s+/g, "_")}.png`;
                    await browser.saveScreenshot(screenshotName);
                    console.log(`  📸 Screenshot saved: ${screenshotName}`);
                  } catch (screenshotErr) {
                    console.log(
                      `  Could not take screenshot: ${screenshotErr.message}`,
                    );
                  }

                  console.log(`  📊 Extracting data for ${label1.name}...`);
                  const label1Data = await extractVerbData(
                    verb,
                    verbType,
                    label1.name,
                  );
                  batchResults.push(label1Data);
                  allResults.push(label1Data);
                  console.log(
                    `  ✅ Successfully processed: ${verb} (${label1.name})`,
                  );
                  console.log(
                    `    Sample value (AO s1 m): "${label1Data.ao.s1.m}"`,
                  );
                }

                // Process Label 2 if it exists
                if (existingLabels.length >= 2) {
                  const label1 = existingLabels[0];
                  const label2 = existingLabels[1];

                  console.log(`\n  📂 Processing section: ${label2.name}`);

                  // STEP 1: COLLAPSE LABEL 1 FIRST
                  console.log(`  🔽 COLLAPSING ${label1.name}...`);
                  try {
                    await label1.element.click();
                    console.log(`    Clicked ${label1.name} to collapse it`);
                    await browser.pause(1500);

                    // Verify Label 1 is collapsed
                    const label1Collapsed = await browser.execute(() => {
                      // Find the label 1 content div
                      const label1Element = document.evaluate(
                        "//label[contains(text(),'ⴰⵙⴼⵜⵉ 1')]",
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null,
                      ).singleNodeValue;

                      if (label1Element) {
                        // Look for associated content - try different methods
                        // Method 1: Check for 'for' attribute linking to an input
                        const forAttr = label1Element.getAttribute("for");
                        if (forAttr) {
                          const checkbox = document.getElementById(forAttr);
                          if (checkbox && checkbox.type === "checkbox") {
                            return !checkbox.checked; // collapsed if unchecked
                          }
                        }

                        // Method 2: Check next sibling visibility
                        let sibling = label1Element.nextElementSibling;
                        if (sibling) {
                          const style = window.getComputedStyle(sibling);
                          return (
                            style.display === "none" ||
                            sibling.offsetHeight === 0
                          );
                        }

                        // Method 3: Check parent's next sibling
                        if (label1Element.parentElement) {
                          sibling =
                            label1Element.parentElement.nextElementSibling;
                          if (sibling) {
                            const style = window.getComputedStyle(sibling);
                            return (
                              style.display === "none" ||
                              sibling.offsetHeight === 0
                            );
                          }
                        }
                      }
                      return false;
                    });

                    if (label1Collapsed) {
                      console.log(
                        `    ✅ VERIFIED: ${label1.name} is COLLAPSED`,
                      );
                    } else {
                      console.log(
                        `    ⚠️ WARNING: ${label1.name} may still be visible!`,
                      );
                      console.log(`    Attempting second collapse click...`);
                      await label1.element.click();
                      await browser.pause(1000);
                    }
                  } catch (collapseErr) {
                    console.log(
                      `    ❌ Error collapsing ${label1.name}: ${collapseErr.message}`,
                    );
                  }

                  // STEP 2: EXPAND LABEL 2
                  console.log(`  🔼 EXPANDING ${label2.name}...`);
                  try {
                    await label2.element.click();
                    console.log(`    Clicked ${label2.name} to expand it`);
                    await browser.pause(2000);

                    // Verify Label 2 is expanded
                    const label2Expanded = await browser.execute(() => {
                      const label2Element = document.evaluate(
                        "//label[contains(text(),'ⴰⵙⴼⵜⵉ 2')]",
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null,
                      ).singleNodeValue;

                      if (label2Element) {
                        // Check for 'for' attribute linking to an input
                        const forAttr = label2Element.getAttribute("for");
                        if (forAttr) {
                          const checkbox = document.getElementById(forAttr);
                          if (checkbox && checkbox.type === "checkbox") {
                            return checkbox.checked; // expanded if checked
                          }
                        }

                        // Check next sibling visibility
                        let sibling = label2Element.nextElementSibling;
                        if (sibling) {
                          const style = window.getComputedStyle(sibling);
                          return (
                            style.display !== "none" && sibling.offsetHeight > 0
                          );
                        }

                        // Check parent's next sibling
                        if (label2Element.parentElement) {
                          sibling =
                            label2Element.parentElement.nextElementSibling;
                          if (sibling) {
                            const style = window.getComputedStyle(sibling);
                            return (
                              style.display !== "none" &&
                              sibling.offsetHeight > 0
                            );
                          }
                        }
                      }
                      return false;
                    });

                    if (label2Expanded) {
                      console.log(
                        `    ✅ VERIFIED: ${label2.name} is EXPANDED`,
                      );
                    } else {
                      console.log(
                        `    ⚠️ WARNING: ${label2.name} may not be expanded!`,
                      );
                      await label2.element.click();
                      await browser.pause(1000);
                    }
                  } catch (expandErr) {
                    console.log(
                      `    ❌ Error expanding ${label2.name}: ${expandErr.message}`,
                    );
                  }

                  // STEP 3: Wait for Label 2 content to be ready
                  console.log(
                    `  ⏳ Waiting for ${label2.name} content to load...`,
                  );
                  try {
                    await browser.waitUntil(
                      async () => {
                        try {
                          const testElement = await $(
                            '//*[@id="list"]/li[1]/table/tbody/tr[3]/td[3]',
                          );
                          if (
                            (await testElement.isExisting()) &&
                            (await testElement.isDisplayed())
                          ) {
                            const text = await testElement.getText();
                            const hasContent = text && text.trim().length > 0;
                            if (hasContent) {
                              console.log(
                                `    ✅ Content loaded for ${label2.name}`,
                              );
                              await browser.pause(1000);
                            }
                            return hasContent;
                          }
                          return false;
                        } catch {
                          return false;
                        }
                      },
                      {
                        timeout: 10000,
                        timeoutMsg: `Content not visible for ${label2.name}`,
                        interval: 500,
                      },
                    );
                  } catch (waitErr) {
                    console.log(
                      `    ⚠️ Content verification timeout: ${waitErr.message}`,
                    );
                  }

                  // Take screenshot for Label 2
                  try {
                    const screenshotName = `./debug_verb_${verb.replace(/[^a-zA-Z0-9]/g, "_")}_${label2.name.replace(/\s+/g, "_")}.png`;
                    await browser.saveScreenshot(screenshotName);
                    console.log(`  📸 Screenshot saved: ${screenshotName}`);
                  } catch (screenshotErr) {
                    console.log(
                      `  Could not take screenshot: ${screenshotErr.message}`,
                    );
                  }

                  // STEP 4: Extract Label 2 data
                  console.log(`  📊 Extracting data for ${label2.name}...`);
                  const label2Data = await extractVerbData2(
                    verb,
                    verbType,
                    label2.name,
                  );

                  batchResults.push(label2Data);
                  allResults.push(label2Data);

                  console.log(
                    `  ✅ Successfully processed: ${verb} (${label2.name})`,
                  );
                  console.log(
                    `    Sample value (AO s1 m): "${label2Data.ao.s1.m}"`,
                  );

                  // Verify data is different
                  const label1Sample =
                    batchResults.find((r) => r.labelType === label1.name)?.ao.s1
                      .m || "";
                  const label2Sample = label2Data.ao.s1.m;

                  if (label1Sample && label2Sample) {
                    if (label1Sample === label2Sample) {
                      console.log(
                        `    ⚠️ WARNING: Label 1 and Label 2 data appear IDENTICAL!`,
                      );
                    } else {
                      console.log(
                        `    ✅ VERIFIED: Label 1 and Label 2 data are DIFFERENT`,
                      );
                    }
                  }
                }
              }
            } else {
              throw new Error("No results found after submission");
            }
          } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
            const failureRecord = {
              verb,
              error: error.message,
              timestamp: new Date().toISOString(),
            };
            batchFailures.push(failureRecord);
            allFailures.push(failureRecord);

            // Try to get back to main page
            try {
              await browser.url(
                "https://tal2.ircam.ma/conjugueur/conjugappl.php",
              );
              await browser.pause(3000);
            } catch (navError) {
              console.log(`  Could not navigate back: ${navError.message}`);
            }
          }

          // Pause between verbs
          await browser.pause(30000);
        }

        // Save batch results
        console.log(`\n${"=".repeat(50)}`);
        console.log(`BATCH ${batchNum + 1} COMPLETE`);
        console.log(`${"=".repeat(50)}`);
        console.log(
          `Batch success: ${batchResults.length}/${batchRows.length}`,
        );
        console.log(`Batch failures: ${batchFailures.length}`);

        const batchOutputData = {
          metadata: {
            batchNumber: batchNum + 1,
            totalBatches: totalBatches,
            batchStartIndex: batchStart,
            batchEndIndex: batchEnd - 1,
            totalProcessed: batchResults.length,
            totalFailed: batchFailures.length,
            timestamp: new Date().toISOString(),
            source: "https://tal2.ircam.ma/conjugueur/conjugappl.php",
          },
          verbs: batchResults,
          failures: batchFailures,
        };

        const batchFilename = `verbs_batch_${String(batchNum + 1).padStart(3, "0")}_of_${totalBatches}.json`;
        const batchJsonOutput = JSON.stringify(batchOutputData, null, 2);

        try {
          await fs.writeFile(batchFilename, batchJsonOutput, "utf8");
          console.log(`✅ Batch ${batchNum + 1} saved to ${batchFilename}`);
          console.log(
            `   File size: ${(batchJsonOutput.length / 1024).toFixed(2)} KB\n`,
          );
        } catch (writeError) {
          console.log(
            `❌ Failed to save batch ${batchNum + 1}: ${writeError.message}\n`,
          );
        }
      }

      // Step 6: Save final consolidated results
      console.log("\n" + "=".repeat(50));
      console.log("ALL BATCHES PROCESSING COMPLETE");
      console.log("=".repeat(50));
      console.log(
        `Total successfully processed: ${allResults.length}/${totalVerbs} verbs`,
      );
      console.log(`Total failures: ${allFailures.length}`);
      console.log(
        `Success rate: ${((allResults.length / totalVerbs) * 100).toFixed(2)}%`,
      );

      const finalOutputData = {
        metadata: {
          totalVerbs: totalVerbs,
          totalProcessed: allResults.length,
          totalFailed: allFailures.length,
          successRate: `${((allResults.length / totalVerbs) * 100).toFixed(2)}%`,
          totalBatches: totalBatches,
          batchSize: BATCH_SIZE,
          timestamp: new Date().toISOString(),
          source: "https://tal2.ircam.ma/conjugueur/conjugappl.php",
        },
        verbs: allResults,
        failures: allFailures,
      };

      const finalJsonOutput = JSON.stringify(finalOutputData, null, 2);

      try {
        await fs.writeFile("verbs_complete_2025.json", finalJsonOutput, "utf8");
        console.log(`\n✅ Complete results saved to verbs_complete_2025.json`);
        console.log(
          `   File size: ${(finalJsonOutput.length / 1024 / 1024).toFixed(2)} MB`,
        );
      } catch (writeError) {
        console.log(
          `❌ Failed to save complete results: ${writeError.message}`,
        );
      }

      // Save summary
      const summaryData = {
        timestamp: new Date().toISOString(),
        totalVerbs: totalVerbs,
        successCount: allResults.length,
        failureCount: allFailures.length,
        successRate: `${((allResults.length / totalVerbs) * 100).toFixed(2)}%`,
        batchesProcessed: totalBatches,
        batchSize: BATCH_SIZE,
        failures: allFailures.map((f) => ({ verb: f.verb, error: f.error })),
      };

      try {
        await fs.writeFile(
          "verbs_summary_2025.json",
          JSON.stringify(summaryData, null, 2),
          "utf8",
        );
        console.log(`✅ Summary saved to verbs_summary_2025.json\n`);
      } catch (summaryError) {
        console.log(`❌ Failed to save summary: ${summaryError.message}\n`);
      }

      if (allResults.length > 0) {
        console.log("✅ Test completed successfully!");
      } else {
        throw new Error("No verb data was extracted");
      }
    } catch (error) {
      console.error("\n" + "=".repeat(50));
      console.error("TEST FAILED WITH ERROR");
      console.error("=".repeat(50));
      console.error("Error message:", error.message);

      try {
        await browser.saveScreenshot("./error_screenshot.png");
        console.log("Error screenshot saved");
      } catch {}

      throw error;
    }
  });
});
