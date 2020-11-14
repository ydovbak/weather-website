"use strict";

const $ = (selector) => document.querySelector(selector);

window.onload = () => {
    $('.day-tab').addEventListener('click', (event) => {
        console.log('called', event);
        // $('#day-of-week').textContent = 'Friday';
    });
};
