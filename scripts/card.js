// card object to be dynamically added to the DOM 
const cardDiv =`<div key=%key% class='card metal linear metal-border flex-fill metal-clicky'>
                    <div class='card-inner match-parent grow-1 card-transform relative'>
                        <div class='card-front card-side match-parent flex-r-cntr metal linear-small'><p>?</p></div>
                        <div class='card-back card-side match-parent flex-fill metal linear-small'>
                            <div style='background-image: %url%' class='card-image mg-1 grow-1'></div>
                        </div>
                    </div>
                </div>`;

// create a card with a key attribute matching its index in the gameData.board array and
// a value matching the image being pulled from the robohash api
// the value is stored in the gamedata.board array and used for match comparisons
// const createCard = (key, value) => {
//     const card = stringToElement(cardDiv);
//     card.setAttribute('key', key);
//     card.getElementsByClassName('card-image')[0].style.backgroundImage = `url('https://robohash.org/${value}')`;
//     return card;
// }

const createCard = (key, value) => {
    let c = cardDiv;
    c = c.replace('%key%', key);
    c = c.replace('%url%', `url(https:\/\/robohash.org\/${value})`);
    return c;
}
// take a valid html string and convert it to nodes
// const stringToElement = (html) => {
//     const template = document.createElement('template')
//     template.innerHTML = html;
//     return template.content.childNodes[0];
// }

export default createCard