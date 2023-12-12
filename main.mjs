import { promises as fs } from 'fs';

// Time customer check-in
const timeCheckin = '2019-12-25';
// File path
const INPUT_FILE_NAME = 'input.json';
const OUTPUT_FILE_NAME = 'output.json';

const categoryMapping = {
    Restaurant: 1,
    Retail: 2,
    Hotel: 3,
    Activity: 4,
};


let offerCategory = [1, 2, 4]; //Offer that are accepted

async function readFile(fileName) {
    try {
        const data = await fs.readFile(fileName, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function writeFile(fileName, data) {
    const jsonData = JSON.stringify(data);
    fs.writeFile(fileName, jsonData, { flag: 'w' }, function (err) {
        if (err) {
            console.error('Lỗi khi ghi vào tệp:', err);
        } else {
            console.log('Đã ghi dữ liệu vào tệp output.json');
        }
    });
}

function timeDiff(time1, time2) {
    const t1 = new Date(time1);
    const t2 = new Date(time2);
    return (t1 - t2) / (1000 * 60 * 60 * 24);
}

function validDate(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) if (timeDiff(data[i]['valid_to'], timeCheckin) >= 5) result.push(data[i]);

    return result;
}

function closestMerchant(merchants) {
    let result = [];
    let tempObject = merchants[0];
    let min = merchants[0]['distance'];
    for (let i = 1; i < merchants.length; i++) {
        if (min > merchants[i]['distance']) {
            min = merchants[i]['distance'];
            tempObject = merchants[i];
        }
    }
    result.push(tempObject);

    return result;
}

function eligibleCategory(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        if (offerCategory.indexOf(data[i]['category']) != -1) {
            let offerTemp = data[i];
            offerTemp['merchants'] = closestMerchant(offerTemp['merchants']);
            result.push(offerTemp);
        }
    }
    return result;
}

function removeSameCategory(offers) {
    let result = [];
    let hash = [0, 0, 0, 0];
    for (let i = 0; i < offers.length; i++) hash[offers[i]['category'] - 1]++;
    for (let i = 0; i < hash.length; i++) console.log(hash[i]);
    for (let i = 0; i < hash.length; i++) {
        if (hash[i] == 1) {
            for (let j = 0; j < offers.length; j++) if (offers[j]['category'] == i + 1) result.push(offers[j]);
        } else if (hash[i] > 1) {
            let posMin = 0;
            let minDis = 100000000000000000;
            for (let j = 0; j < offers.length; j++)
                if (offers[j]['category'] == i + 1) {
                    if (minDis > offers[j]['merchants'][0]['distance']) {
                        minDis = offers[j]['merchants'][0]['distance'];
                        posMin = j;
                    }
                }
            result.push(offers[posMin]);
        }
    }
    return result;
}

function twoOffersClosest(offers) {
    let tempOffers = offers;
    let result = [];
    for (let i = 0; i < tempOffers.length - 1; i++) {
        for (let j = i + 1; j < tempOffers.length; j++) {
            if (tempOffers[i]['merchants'][0]['distance'] < tempOffers[j]['merchants'][0]['distance']) {
                let temp = tempOffers[i]['merchants'][0]['distance'];
                tempOffers[i]['merchants'][0]['distance'] = tempOffers[j]['merchants'][0]['distance'];
                tempOffers[j]['merchants'][0]['distance'] = temp;
            }
        }
    }
    result.push(tempOffers[0]);
    result.push(tempOffers[1]);
    return result;
}

async function main() {
    readFile(INPUT_FILE_NAME)
        .then((data) => {
            const offerValidDate = validDate(data.offers);
            const eligibleCategoryOffer = eligibleCategory(offerValidDate);
            const removedSameCategory = removeSameCategory(eligibleCategoryOffer);
            const finalResult = twoOffersClosest(removedSameCategory);
            writeFile(OUTPUT_FILE_NAME, finalResult);
        })
        .catch((err) => {
            console.log(err);
        });
}
main();
