// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

const test_dict = 'rip ripe prim prime impure premium mire umpire obelisk';
const longer_list =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const short_list =
  'https://raw.githubusercontent.com/lor-ethan/Word-Game/master/routes/wordlist.txt';
fetch(longer_list)
  .then((res) => res.text())
  .then((res) => {
    main_2(res);
  })
  .catch((err) => {
    console.log(err);
  });

function make_hashmap(dict) {
  const x = {};
  const lines = dict.split(' ');
  for (const line of lines) {
    const sorted_index = line.split('').sort().join('');
    if (x[sorted_index]) {
      x[sorted_index].push(line);
    } else {
      x[sorted_index] = [line];
    }
  }
  return x;
}

function make_hashmap_2(dict) {
  const x = {};
  const lines = dict.split('\r');
  for (const line of lines) {
    const sanitized = line.replace(/[-\n\r]+/g, '');
    const sorted_index = sanitized.split('').sort().join('');
    if (x[sorted_index]) {
      x[sorted_index].push(sanitized);
    } else {
      x[sorted_index] = [sanitized];
    }
  }
  return x;
}

const hashmap = make_hashmap(test_dict);

function remove_char_at_index(x: string, index: number) {
  return x.slice(0, index).concat(x.slice(index + 1));
}

function* find_connecting_words(x, indexed_dict, index) {
  if (index >= x.length || x.length === 3) {
    return false;
  }
  // remove a char from x
  let sub_x = remove_char_at_index(x, index);
  // does sub_x exist in indexed_dict?
  if (indexed_dict[sub_x]) {
    // keep going
    yield indexed_dict[sub_x];
    yield* find_connecting_words(sub_x, indexed_dict, 0);
  } else {
    // try another index
    yield* find_connecting_words(x, indexed_dict, index + 1);
  }
}

function main(indexed_dict) {
  const starters = Object.keys(indexed_dict).filter((x) => x.length === 7);
  let curr = starters.pop();
  let result = [];
  while (typeof curr !== 'undefined') {
    const game_set = {
      root: curr,
      children: [],
    };
    const gen = find_connecting_words(curr, indexed_dict, 0);
    for (const x of gen) {
      game_set.children.push(x);
    }
    curr = starters.pop();
    result.push(game_set);
  }
}

function main_2(text) {
  const hashmap = make_hashmap_2(text);
  const starters = Object.keys(hashmap).filter((x) => x.length === 7);
  let curr = starters.pop();
  let result = [];
  while (typeof curr !== 'undefined') {
    const game_set = {
      root: hashmap[curr],
      children: [],
    };
    const gen = find_connecting_words(curr, hashmap, 0);
    for (const x of gen) {
      game_set.children.push(x);
    }
    curr = starters.pop();
    if (game_set.children.length === 4) {
      result.push(game_set);
    }
  }
}

main(hashmap);
