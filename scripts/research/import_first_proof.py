"""Import the supplied screening workbook without upgrading its evidence claims.

Usage: python3 scripts/research/import_first_proof.py path/to/register.xlsx
Only the standard library is required. Editorial reviews live separately.
"""

import hashlib
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
HEADERS = ["ID", "Person", "Domain", "Intake status", "Located milestone age",
           "Earliest located proof", "Earlier background", "Unresolved issue / audit",
           "Research depth", "Source 1", "Source 2", "Source 3", "Publication status"]
FIELDS = ["id", "name", "domain", "intakeStatus", "milestoneAge", "locatedProof",
          "background", "unresolvedIssue", "researchDepth"]


def read_sheets(workbook):
    with zipfile.ZipFile(workbook) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ["".join(item.itertext()) for item in ET.fromstring(
                archive.read("xl/sharedStrings.xml")).findall("x:si", NS)]
        relationships = {item.attrib["Id"]: item.attrib["Target"] for item in
                         ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))}
        sheets = {}
        for sheet in ET.fromstring(archive.read("xl/workbook.xml")).findall("x:sheets/x:sheet", NS):
            target = relationships[sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
            target = target.lstrip("/") if target.startswith("/") else "xl/" + target
            rows = []
            for row in ET.fromstring(archive.read(target)).findall("x:sheetData/x:row", NS):
                cells = {}
                for cell in row.findall("x:c", NS):
                    value = cell.find("x:v", NS)
                    kind = cell.attrib.get("t")
                    if kind == "s":
                        text = strings[int(value.text)]
                    elif kind == "inlineStr":
                        text = "".join(cell.find("x:is", NS).itertext())
                    else:
                        text = value.text if value is not None else ""
                    cells["".join(char for char in cell.attrib["r"] if char.isalpha())] = text
                rows.append((int(row.attrib["r"]), cells))
            sheets[sheet.attrib["name"]] = rows
        return sheets


def main():
    workbook = Path(sys.argv[1])
    sheets = read_sheets(workbook)
    sources = [{"id": row["A"], "domain": row["B"], "url": row["C"], "people": row["D"]}
               for _, row in sheets["Sources"][1:]]
    source_ids = {source["url"]: source["id"] for source in sources}
    records = []
    for sheet in ["Candidates", "Held back"]:
        assert [sheets[sheet][0][1].get(chr(65 + index), "") for index in range(13)] == HEADERS, "Workbook columns changed"
        for row_number, row in sheets[sheet][1:]:
            record = {field: row.get(chr(65 + index), "") for index, field in enumerate(FIELDS)}
            record["sourceIds"] = [source_ids[row[column]] for column in ["J", "K", "L"] if row.get(column)]
            record["publicationStatus"] = row["M"]
            record["provenance"] = {"sheet": sheet, "row": row_number}
            assert record["intakeStatus"] in (["C"] if sheet == "Held back" else ["A", "B"])
            records.append(record)
    assert len({record["id"] for record in records}) == len(records), "Duplicate person IDs"
    assert len({record["name"] for record in records}) == len(records), "Duplicate names need review"
    assert len(source_ids) == len(sources), "Duplicate source URLs"
    data = {"snapshotDate": "2026-10-11", "workbook": workbook.name,
            "workbookSha256": hashlib.sha256(workbook.read_bytes()).hexdigest(),
            "sources": sources, "records": records}
    destination = Path(__file__).resolve().parents[2] / "src/data/first-proof-register.json"
    destination.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"Imported {len(records)} people and {len(sources)} sources. No editorial classifications inferred.")


if __name__ == "__main__":
    main()
