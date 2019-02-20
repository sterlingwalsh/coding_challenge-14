const cardDiv =`<div class='card metal linear metal-border flex-fill metal-clicky'>
                    <div class='card-inner match-parent grow-1'>
                        <div class='card-front card-side match-parent flex-cntr metal linear-small'><p>?</p></div>
                        <div class='card-back card-side match-parent flex-fill metal linear-small'>
                            <div class='card-image mg-1 grow-1'></div>
                        </div>
                    </div>
                </div>`;

const createCard = (key, value) => {
    const card = stringToElement(cardDiv);
    card.setAttribute('key', key);
    card.getElementsByClassName('card-image')[0].style.backgroundImage = `url('https://robohash.org/${value}')`;
    return card;
}

const stringToElement = (html) => {
    const template = document.createElement('template')
    template.innerHTML = cardDiv;
    return template.content.childNodes[0];
}

export default createCard