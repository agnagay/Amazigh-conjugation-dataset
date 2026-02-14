import { deleteMatches, readFileToArray } from "./checkstring.js";
const list1 = readFileToArray("doubles.txt");
const list2 = readFileToArray("chafik_verbs.txt");
deleteMatches(list1, list2);
