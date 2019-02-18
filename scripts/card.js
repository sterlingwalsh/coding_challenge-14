const cardDiv =`<div class='card'>
                    <div class='card-front card-side match-parent flex-cntr ignore-click'><p>?</p></div>
                    <div class='card-back card-side match-parent ignore-click'></div>
                </div>`;

const createCard = (key, value) => {
    const card = stringToElement(cardDiv);
    card.setAttribute('key', key);
    card.getElementsByClassName('card-back')[0].style.backgroundImage = `url('https://robohash.org/${value}')`;
    return card;
}

const stringToElement = (html) => {
    const template = document.createElement('template')
    template.innerHTML = cardDiv;
    return template.content.childNodes[0];
}

export default createCard