#!/usr/bin/env node

import * as fs from "fs";

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node csv2json.js <input.csv> <output.json>");
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

// Read CSV file
let csvContent;
try {
  csvContent = fs.readFileSync(inputFile, "utf8");
} catch (error) {
  console.error("Error reading CSV file:", error.message);
  process.exit(1);
}

// Parse CSV with semicolon delimiter
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = parseCsvLine(lines[0]);

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCsvLine(lines[i]);
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    data.push(obj);
  }

  return data;
}

// Parse a single CSV line (handles quoted fields with semicolons)
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ";" && !inQuotes) {
      // Field separator
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current); // Add last field
  return result;
}

// Convert flat structure to nested JSON
function convertToNestedJSON(flatData) {
  return flatData.map((row) => {
    const result = {
      name: row.name,
    };

    // Check if we have en columns or just a single en field
    const hasenColumns = Object.keys(row).some((key) => key.match(/^en\d+/));

    if (hasenColumns) {
      // Has numbered en columns - create nested structure
      const enObj = {};

      // First, check if the base "en" column has a value
      const baseenValue = row.en?.trim();
      if (baseenValue) {
        enObj.en = baseenValue;
      }

      // Then process the numbered columns
      Object.keys(row).forEach((key) => {
        if (key === "name" || key === "en") return;

        const match = key.match(/^en(\d+)(?:_(\d+))?$/);
        if (match) {
          const mainNum = match[1];
          const subNum = match[2];
          const value = row[key]?.trim();

          // Skip empty values
          if (!value) return;

          if (subNum) {
            // Sub-item like en1_1, en1_2
            if (!enObj[`en${mainNum}`]) {
              enObj[`en${mainNum}`] = {};
            }
            enObj[`en${mainNum}`][`en${mainNum}_${subNum}`] = value;
          } else {
            // Main item like en2 (no sub-items)
            enObj[`en${mainNum}`] = value;
          }
        }
      });

      // Only add en object if it has content
      if (Object.keys(enObj).length > 0) {
        result.en = enObj;
      }
    } else {
      // Single en field
      const enValue = row.en?.trim();
      if (enValue) {
        result.en = enValue;
      }
    }

    return result;
  });
}

// Parse CSV
const flatData = parseCSV(csvContent);

// Convert to nested JSON
const nestedData = convertToNestedJSON(flatData);

// Write JSON file
try {
  const jsonContent = JSON.stringify(nestedData, null, 2);
  fs.writeFileSync(outputFile, jsonContent, "utf8");
  console.log(`✓ JSON file created successfully: ${outputFile}`);
  console.log(`  Processed ${nestedData.length} record(s)`);
} catch (error) {
  console.error("Error writing JSON file:", error.message);
  process.exit(1);
}
