import { parseMessage } from "../src/Components/ScrivitoExtensions/ChatbotTab/parseMessage";

test("detecting prose and HTML", () => {
  const message = `Barfoo:
\`\`\`html
<html id="c2a0aab78be05a4e" type="Homepage" data-tcDescription="Foobar">
  <widget id="3f6505d1" type="SpaceWidget" data-size="5"></widget>
  <widget id="6a85a69f" type="TextWidget" data-alignment="right"><p>Fizzbuzz</p></widget>
</html>
\`\`\``;

  expect(parseMessage(message)[0]).toBe("Barfoo:\n");
  expect(parseMessage(message)[1]).toContain("3f6505d1");
  expect(parseMessage(message)[1]).toContain("6a85a69f");
  expect(parseMessage(message)[2]).toBeFalsy();
});
