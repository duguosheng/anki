/* eslint-disable no-param-reassign */
import { workspace } from "vscode";

import { Card } from "../models/Card";
import { CardParser } from "./parsers/cardParser";
import { getLogger } from "../logger";

interface ParsedData {
  /** DeckName can be null in which case we use the defaultDeck */
  deckName: string | null;
  cards: Card[];
  //   media: Media[];
}

export class Serializer {
  private source: string;
  private useDefault: boolean;

  public constructor(source: string, useDefault: boolean) {
    this.source = source;
    this.useDefault = useDefault;
  }

  public async transform(): Promise<ParsedData> {
    const markdownSource = this.source;
    return await this.splitByCards(markdownSource);
  }

  private getConfig(conf: string) {
    return workspace.getConfiguration("anki.md").get(conf);
  }

  private async splitByCards(mdString: string): Promise<ParsedData> {
    let rawCards = mdString
      .split(new RegExp(this.getConfig("card.separator") as string, "m"))
      .map((line) => line.trim());

    const deckName = this.deckName(rawCards);

    // If we call "send to own deck" we need the title, if we don't have it error out here
    if (!deckName && this.useDefault === false) {
      getLogger().error(
        "Serializer: Could not find H1 title in this document!"
      );
      throw new Error("Unable to parse title!");
    }

    // filter out deck title
    rawCards = rawCards.filter(
      (str) =>
        str.search(this.getConfig("deck.titleSeparator") as string) === -1
    );

    const parsedCards = await Promise.all(
      rawCards.map((str) => new CardParser().parse(str))
    );
    const cards = parsedCards
      // card should have at least a front side
      // Cloze cards don't need an answer side
      .filter((card) => card?.question);

    // get media from markdown file
    // const media = this.mediaFromCards(cards);

    return {
      deckName,
      cards,
      //   media,
    };
  }

  deckName(rawCards: string[]): string | null {
    const deckName = rawCards.reduce((acc, str) => {
      const match = str.match(
        new RegExp(this.getConfig("deck.titleSeparator") as string, "m")
      );

      if (match && match.input) {
        // Handle frontmatter
        // There could be frontmatter in this string, we need to slice it out, we can get the index of where the match happened and remove everything before
        return match.input.slice(match.index);
      }

      return acc;
    }, "");

    if (!deckName) {
      return null;
    }

    return deckName.replace(/(#\s|\n)/g, "");
  }

  /**
   * Search media in cards and add it to the media collection
   */
  //   private mediaFromCards(cards: Card[]) {
  //     const mediaList = [];

  //     cards.forEach((card) => {
  //       card.question = this.prepareMediaForSide(card.question, mediaList);
  //       card.answer = this.prepareMediaForSide(card.answer, mediaList);
  //     });

  //     return mediaList;
  //   }

  /**
   * Prepare media from card's and prepare it for using
   * @param {string} side
   * @param {[Media]} mediaList
   * @private
   */
  //   prepareMediaForSide(side, mediaList) {
  //     const pattern = /src="([^"]*?)"/g;

  //     const prepare = (match, p1) => {
  //       const filePath = path.resolve(path.dirname(this.source), p1);
  //       const fileExt = path.extname(filePath);

  //       const data = fs.readFileSync(filePath);
  //       const media = new Media(data);

  //       media.fileName = `${media.checksum}${fileExt}`;

  //       const hasMedia = mediaList.some(
  //         (item) => item.checksum === media.checksum
  //       );
  //       if (!hasMedia) {
  //         mediaList.push(media);
  //       }

  //       return `src="${media.fileName}"`;
  //     };

  //     return side.replace(pattern, prepare);
  //   }
}
