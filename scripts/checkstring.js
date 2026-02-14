import fs from "fs";

// Function to read a text file and return its contents as an array
export function readFileToArray(filePath) {
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
// Function to delete matching elements from list2
export function deleteMatches(list1, list2) {
  for (let i = 0; i < list2.length; i++) {
    if (list1.includes(list2[i])) {
      list2.splice(list2.indexOf(list2[i]), 1);
    }
  }
  for (let i in list2) {
    console.log(list2[i]);
  }
  return list2;
}

// Check for existence of elements from list1 in list2
export default function CheckExistElements(list1, list2) {
  const matches = list1.filter((item) => list2.includes(item));
  // Output the results
  if (matches.length > 0) {
    console.log("The following strings from list1.txt exist in list2.txt:");
    matches.forEach((match) => console.log(match));
  } else {
    console.log("No strings from list1.txt exist in list2.txt.");
  }
}
