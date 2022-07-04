import { CardParser } from "../parsers/cardParser";

describe("Latex", () => {
  it("The '\\' in latex should be retained ", async () => {
    // linesToHtml always return a newline at the end of string
    const htmlLatex = "<p>\\(a=\\%1\\)<br>\\(b=\\#1\\)<br>\\[<br>c=\\$1<br>d=\\_1<br>\\]</p>\n";
    const input = [
      "$a=\\%1$",
      "$b=\\#1$",
      "$$",
      "c=\\$1",
      "d=\\_1",
      "$$"
    ];
    const cardParser = new CardParser();
    // Act 
    const result = (await cardParser.linesToHtml(input));
    // Assert
    expect(result).toEqual(htmlLatex);
  });
  it("The '\\\\' in latex should be retained ", async () => {
    const htmlLatex = "<p>\\[<br>\\begin{align}<br>a=\\%100 \\\\<br>b=\\%90<br>\\end{align}<br>\\]</p>\n";
    const input = [
      "$$",
      "\\begin{align}",
      "a=\\%100 \\\\",
      "b=\\%90",
      "\\end{align}",
      "$$"
    ];
    const cardParser = new CardParser();
    // Act
    const result = (await cardParser.linesToHtml(input));
    // Assert
    expect(result).toEqual(htmlLatex);
  });
  it("Should not affect the conversion outside of latex", async () => {
    const htmlLatex = "<p>%</p>\n";
    const input = [
      "\\%"
    ];
    const cardParser = new CardParser();
    // Act
    const result = (await cardParser.linesToHtml(input));
    // Assert
    expect(result).toEqual(htmlLatex);
  });
});
