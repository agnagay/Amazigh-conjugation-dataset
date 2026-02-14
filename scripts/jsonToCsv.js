#!/usr/bin/env node

import fs from "fs";

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node json2csv.js <input.json> <output.csv>");
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

// Read and parse JSON file
let data;
try {
  const jsonContent = fs.readFileSync(inputFile, "utf8");
  data = JSON.parse(jsonContent);
} catch (error) {
  console.error("Error reading JSON file:", error.message);
  process.exit(1);
}

// Ensure data is an array
if (!Array.isArray(data)) {
  data = [data];
}

// Process each entry
const processedData = data.map((entry) => {
  const result = { name: entry.name };

  if (!entry.fr) {
    result.fr = "";
    return result;
  }

  const frText = entry.fr;

  // Check if numbered format exists (1. or 2. etc.)
  const hasNumbering = /^\s*\d+\./.test(frText);

  if (hasNumbering) {
    // Has numbering - leave fr empty and split into fr1_x, fr2_x columns
    result.fr = "";

    // Split by numbered items (1., 2., 3., etc.)
    const numberedPattern = /(\d+)\.\s*([^\n]*(?:\n(?!\d+\.)[^\n]*)*)/g;
    let match;

    while ((match = numberedPattern.exec(frText)) !== null) {
      const itemNumber = match[1];
      const itemContent = match[2].trim();

      if (!itemContent) continue;

      // Split by semicolon for sub-items
      const subItems = itemContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s);

      if (subItems.length === 1) {
        // Only one item, no semicolon splits
        result[`fr${itemNumber}`] = subItems[0];
      } else {
        // Multiple sub-items
        subItems.forEach((subItem, subIndex) => {
          result[`fr${itemNumber}_${subIndex + 1}`] = subItem;
        });
      }
    }
  } else {
    // No numbering - use single fr column
    result.fr = frText.trim();
  }

  return result;
});

// Get all unique column names
const allColumns = new Set(["name", "fr"]);
processedData.forEach((row) => {
  Object.keys(row).forEach((key) => {
    if (key !== "name" && key !== "fr") {
      allColumns.add(key);
    }
  });
});

// Sort columns: name, fr, then fr1_1, fr1_2, fr2, etc.
const sortedColumns = ["name", "fr"];
const frColumns = Array.from(allColumns)
  .filter((col) => col.startsWith("fr") && col !== "fr")
  .sort((a, b) => {
    // Extract numbers for proper sorting
    const aMatch = a.match(/fr(\d+)(?:_(\d+))?/);
    const bMatch = b.match(/fr(\d+)(?:_(\d+))?/);

    if (aMatch && bMatch) {
      const aNum1 = parseInt(aMatch[1]);
      const bNum1 = parseInt(bMatch[1]);
      if (aNum1 !== bNum1) return aNum1 - bNum1;

      const aNum2 = aMatch[2] ? parseInt(aMatch[2]) : 0;
      const bNum2 = bMatch[2] ? parseInt(bMatch[2]) : 0;
      return aNum2 - bNum2;
    }

    return a.localeCompare(b);
  });

sortedColumns.push(...frColumns);

// Escape CSV field if needed (using semicolon as delimiter)
function escapeCsvField(field) {
  if (field == null) return "";
  const str = String(field);
  if (str.includes(";") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate CSV content with semicolon delimiter
const csvHeader = sortedColumns.join(";");
const csvRows = processedData.map((row) => {
  return sortedColumns.map((col) => escapeCsvField(row[col] || "")).join(";");
});

const csvContent = [csvHeader, ...csvRows].join("\n");

// Write CSV file
try {
  fs.writeFileSync(outputFile, csvContent, "utf8");
  console.log(`✓ CSV file created successfully: ${outputFile}`);
  console.log(`  Processed ${processedData.length} record(s)`);
  console.log(`  Columns: ${sortedColumns.join(", ")}`);
} catch (error) {
  console.error("Error writing CSV file:", error.message);
  process.exit(1);
}
