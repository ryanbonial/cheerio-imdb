const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const scrapeImdb = async (imdbId) => {
  const baseUrl = 'https://www.imdb.com/title';
  const movieUrl = `${baseUrl}/${imdbId}/`;
  const res = await fetch(movieUrl);

  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('.title_wrapper > h1').first().contents().filter(function () { return this.type === 'text'; }).text().trim();
  const titleYear = $('#titleYear > a').text().trim();
  const posterUrl = $('.poster img').first().attr('src');
  const plotSummary = $('.plot_summary .summary_text').text().trim();
  const castList = [];
  $('table.cast_list tbody tr').each((idx, castElem) => {
    castList.push({
      name: $('td.primary_photo img', castElem).attr('title'),
      thumbnailUrl: $('td.primary_photo img', castElem).attr('src'),
      character: $('td.character', castElem).text().trim(),
    });
  });
  castList.shift();

  return {
    movieUrl,
    title,
    titleYear,
    posterUrl,
    plotSummary,
    castList
  }
}

const movieIds = [
  'tt0111161', // Shawshank
  'tt0109830', // Forrest Gump
  'tt0110912', // Pulp Fiction
  'tt0068646', // Godfather
  'tt0137523', // Fight Club
  'tt0088763', // BTTF
  'tt0118715', // Lebowski
  'tt0080684', // Star Wars
  'tt0246578', // Donnie Darko
  'tt0054698', // Breakfast at Tiffany's
  'tt0088847', // Breakfast Club
  'tt0374900', // Napolean Dynamite
  'tt2278388', // Grand Budapest
  'tt0128445', // Rushmore
  'tt0087332', // Ghostbusters
  'tt0103919', // Candyman
  'tt0113243', // Hackers
  'tt0245429', // Spririted Away
  'tt0086567', // War Games
  'tt0091817', // Rad
];
const movies = [];

async function queueMovies(ids) {
  const movieData = await scrapeImdb(ids[0]);
  console.log(`Processed ${ids[0]} - ${movieData.title}`);
  movies.push(movieData);
  if (ids.length > 1) {
    setTimeout(() => queueMovies(ids.splice(1)), 5000);
  } else {
    fs.writeFile(
      'data/movies.json',
      JSON.stringify(movies),
      err => console.log(err ? err : 'Movie data was successfully saved')
    );
  }
}

queueMovies(movieIds);
