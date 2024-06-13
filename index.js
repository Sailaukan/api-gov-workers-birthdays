const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const app = express();

const port = process.env.PORT || 3000;
const url = 'https://yedilov.online/birthdays';

let birthdays = [];
let birthdayDates = [];
let groupedBirthdays = [];
let month = ''

const groupBirthdays = (birthdays) => {
    let groupedBirthdays = [];
    let currentGroup = [];

    for (let i = 0; i < birthdays.length; i++) {
        if (birthdays[i] !== '') {
            currentGroup.push(birthdays[i]);
        } else if (currentGroup.length > 0 && birthdays[i - 1] !== '') {
            groupedBirthdays.push([...currentGroup]);
            currentGroup = [];
        }
    }

    if (currentGroup.length > 0) {
        groupedBirthdays.push([...currentGroup]);
    }

    return groupedBirthdays;
};

const fetchData = async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        
        const $ = cheerio.load(content);

        birthdays = [];

        $(".birthdays__title").each((i, e) => {
            const text = $(e).text().trim();
            const firstWord = text.split(' ')[0];
            month = text.split(' ')[1];
            birthdayDates.push(firstWord);
        });

        $(".grid__item").each((i, e) => { 
            const name = $(e).find('.block__flex_space h5').text().trim();
            birthdays.push(name);
        });

        groupedBirthdays = groupBirthdays(birthdays);

        console.log(groupedBirthdays);
        console.log(birthdayDates);

        await browser.close();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

fetchData();

setInterval(fetchData, 3600000);

app.get('/birthdays', (req, res) => {
    console.log([...groupedBirthdays, birthdayDates])
    res.send([...groupedBirthdays, birthdayDates]);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});