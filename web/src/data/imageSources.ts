const steamImages: Record<string, string> = {
  "Ori and the Will of the Wisps": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/header.jpg",
  "EA Sports FC 24": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/header.jpg",
  "Overcooked 2": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/728880/header.jpg",
  "Forza Horizon 5": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg",
  "Age of Empires IV": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/header.jpg",
  "Cuphead": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/header.jpg",
  "Sonic Mania": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/584400/header.jpg",
  "Street Fighter 6": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/header.jpg",
  "Tekken 8": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1778820/header.jpg",
  "Tetris Effect: Connected": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1003590/header.jpg",
  "Gran Turismo 7": "https://en.wikipedia.org/wiki/Special:FilePath/Gran%20Turismo%207%20cover%20art.jpg",
  "Professor Layton and the Curious Village": "https://www.nintendoworldreport.com/media/12952/4/6.jpg",
  "League of Legends": "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
};
export function resolveGameImage(title: string, imageUrl?: string): string | undefined {
  if (!imageUrl || imageUrl.includes("placehold.co")) return steamImages[title];
  return imageUrl;
}
