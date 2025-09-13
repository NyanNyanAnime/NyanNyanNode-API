const cheerio = require("cheerio");


const getEpisodeList = async (url, episodeList = []) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const episodeListRaw = $("#episodeLists").attr("data-content");
    const episodeList$ = cheerio.load(episodeListRaw);

    const episodesOnThisPage = episodeList$("a.btn-danger")
      .map((index, element) => {
        const episodeTitle = episodeList$(element).text().trim();
        const episodeUrl = episodeList$(element).attr("href");

        let episodeId = null;
        if (episodeUrl) {
          const parts = episodeUrl.split("/").filter(Boolean);
          episodeId = parts.includes("episode")
            ? parts[parts.length - 1]
            : null;
        }

        return {
          title: episodeTitle,
          url: episodeUrl,
          episodeId,
        };
      })
      .get();

    episodeList.push(...episodesOnThisPage);

    const nextPageUrl = episodeList$("a.page__link__episode i.fa-forward")
      .parent()
      .attr("href");

    if (nextPageUrl) {
      const fullNextPageUrl = new URL(nextPageUrl, url).href;
      return await getEpisodeList(fullNextPageUrl, episodeList);
    }

    return episodeList;
  } catch (error) {
    console.error(error);
    return episodeList;
  }
};

module.exports = getEpisodeList;
