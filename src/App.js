const Scraper = require('./modules/Scraper');
const Mail = require('./modules/Mail');
const Config = require('./modules/Config');
const _ = require('lodash');
const Discord = require('discord.js');

let offers = [];








function getOffers() {
    Scraper().then(newOffers => {
        const beforeScraperOffersLength = offers.length;
        //Filtrujemy unikalne obiekty na podstawie adresu url z olx.pl
        offers = _.uniqBy([...offers, ...newOffers], 'url');
        //Jeśli pojawiły się nowe oferty
        if (offers.length > beforeScraperOffersLength) {
            const newOffersCount = offers.length - beforeScraperOffersLength;
            const message = `Found ${newOffersCount} new offers on OLX!`;

            const client = new Discord.Client({
                intents: ['MessageContent', 'Guilds', 'GuildMessages']
            });


            client.on('ready', () => {

                console.log(`Logged in as ${client.user.tag}`);
                const channelId = Config.discord.channelID;
                const channel = client.channels.cache.get(channelId);
                if (channel) {
                    newOffers.map(offer => channel.send({
                        embeds: [
                            {
                                "title": offer.title,
                                "url": offer.url,
                                "description": `*${offer.location?.split(" - ")[1]}*\n**${offer.price}**\n${offer.location?.split(" - ")[0]}`,
                                "color": 3387490,
                                "thumbnail": {
                                    "url": offer.image?.includes('.svg') ? "" : offer.image

                                }
                            }
                        ]
                    }))



                    // newOffers.map(offer => 

                    // `*${offer.location?.split(" - ")[1]}*\n${offer.title}\n**${offer.url}

                    //  - ${offer.price} - `



                    // ).join('\n\n'), { disableLinkPreview: true })
                } else {
                    console.error(`Unable to find channel ${channelId}`);
                }
            });

            client.login(Config.discord.token);



        }
    });
}

console.log('Starting scraper...');
getOffers();
setInterval(getOffers, Config.refreshTime);
