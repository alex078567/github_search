'use strict';

// Импорт методов и переменных, необходимых для работы кастомной валидации
import {
	validateForm,
	validateSingleFormGroup,
	validationOptions,
} from './validation.js';

// Получаем форму
const form = document.querySelector('.form');
// Получаем контейнер для репозиториев
const listOfRepos = document.querySelector('.repository-container');

//Добаляем к форме обработчик
form.addEventListener('submit', (event) => {
	event.preventDefault();
	const isError = validateForm(form);
	// если форма не прошла валидацию не отправлять
	if (isError) {
		return;
	}
	const textInput = form.elements.userInput;
	searchGithubRepos(textInput.value);
});

formValidationSetUp();

/**
 * Функция "настраивает" форму для валидации.
 */
function formValidationSetUp() {
	// Отключаем html валидацию.
	form.setAttribute('novalidate', '');
	// Каждому элементу ввода добавляем обработчик, который проверяет соответствуют ли
	// введенные данные установленным ограничениям. Обработчик срабатывает когда
	// элемент теряет фокус
	Array.from(form.querySelectorAll('input,textarea')).forEach((element) => {
		element.addEventListener('blur', (event) => {
			validateSingleFormGroup(event.target.closest('.form__group'));
		});
		// убираем валидацию при вводе.
		element.addEventListener('input', (event) => {
			event.target.nextElementSibling.innerHTML = '';
		});
	});
}

/**
 * Асинхронная функция, которая производит fetch запрос на сервер github.
 * Если загрузка занимает некоторое время, то показывается спиннер загрузки.
 * При возникновении ошибок они выводятся на экран.
 * @param {string} repoName - имя репозитория
 */
async function searchGithubRepos(repoName) {
	showLoading(true);
	try {
		const url = `https://api.github.com/search/repositories?q=${repoName}&sort=stars&order=desc&per_page=10&page=1`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(response.status);
		}
		const json = await response.json();
		const arrayOfRepos = json.items;
		clearRepoContainer();
		printResults(arrayOfRepos);
	} catch (error) {
		printMessage(`Возникла ошибка! 	${error}`);
	}
}

/**
 * Функция, выводящая результаты запроса на экран
 * @param {[]} resultArray - массив с результатами запроса на сервер
 */
function printResults(resultArray) {
	console.log(resultArray);
	if (resultArray.length < 1) {
		const message = `Ничего не найдено. Повторите поиск &uarr;, изменив название
	репозитория`;
		printMessage(message);
	}
	resultArray.forEach((repositoryData) => {
		const {
			name: repoName,
			owner: { avatar_url: avatarUrl, login: ownerName },
			html_url: repoUrl,
			stargazers_count: starsNumber,
			forks_count: forksNumber,
		} = repositoryData;

		const repo = document.createElement('div');
		repo.classList.add('repository');
		repo.innerHTML = `
		<p class="repository__field-description">Репозиторий:</p>
						<h2 class="repository__name">
							<a
								class="repository__name-link"
								href=${repoUrl}
								target="_blank"
								rel="noopener noreferrer"
								>${repoName}</a
							>
						</h2>
						<p class="repository__field-description">Владелец:</p>

						<div class="repository__owner-container">
							<img
								class="repository__owner-avatar"
								src=${avatarUrl}
								alt="аватар пользователя"
							/>
							<h3 class="repository__owner">${ownerName}</h3>
						</div>
						<div class="repository__stars-forks-container">
							<ion-icon class="repository__icon" name="star-outline"></ion-icon>
							<p>${starsNumber} stars</p>
						</div>
						<div class="repository__stars-forks-container">
							<ion-icon
								class="repository__icon"
								name="git-network-outline"
							></ion-icon>

							<p>${forksNumber} forks</p>
						</div>
					</div>
		`;
		listOfRepos.append(repo);
	});
}

/**
 * Функция, выводящая спиннер загрузки на экран
 */
function showLoading() {
	listOfRepos.innerHTML = `
	<div class="loader"></div>
	`;
}

/**
 * Функция, очищающая контейнер с репозиториями
 */
function clearRepoContainer() {
	listOfRepos.innerHTML = ``;
}

/**
 * Функция, выводящая на экран сообщение
 * @param {string} messageText - текст сообщения
 */
function printMessage(messageText) {
	listOfRepos.innerHTML = `<p class="repository-container__nothing-found">
	${messageText}
	</p>`;
}
