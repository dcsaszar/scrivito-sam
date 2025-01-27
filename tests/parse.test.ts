import { parseMessage } from "../src/Components/ScrivitoExtensions/ChatbotTab/parseMessage";

test("detecting prose and HTML", () => {
  const result = parseMessage(`Barfoo:
\`\`\`html
<html id="c2a0aab78be05a4e" type="Homepage" data-tcDescription="Foobar">
  <widget id="3f6505d1" type="SpaceWidget" data-size="5"></widget>
  <widget id="6a85a69f" type="TextWidget" data-alignment="right"><p>Fizzbuzz</p></widget>
</html>
\`\`\``);

  expect(result[0]).toEqual({ type: "text", value: "Barfoo:" });
  expect(result[1].type).toBe("html");
  expect(result[1].value).toContain("3f6505d1");
  expect(result[1].value).toContain("6a85a69f");
  expect(result.length).toBe(2);
});
