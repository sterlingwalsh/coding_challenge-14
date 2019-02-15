const cardDiv =`<div class='card'>
                    <div class='card-front'>Front</div>
                    <div class='card-back'>Back</div>
                </div>`;

const createCard = (id) => {
    let element = stringToElement(cardDiv);
    element.setAttribute('key', id);
    return element;
}

const stringToElement = (html) => {
    const template = document.createElement('template')

    template.innerHTML = cardDiv;
    return template.content.childNodes[0];
}

export default createCard