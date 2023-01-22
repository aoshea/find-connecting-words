// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Available Word Sets</h1>`;

const test_dict = 'rip ripe prim prime impure premium mire umpire obelisk';
const alt_12_dict =
  'https://raw.githubusercontent.com/en-wl/wordlist/master/alt12dicts/2of4brif.txt';
const longer_list =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const short_list =
  'https://raw.githubusercontent.com/lor-ethan/Word-Game/master/routes/wordlist.txt';

function request_dict() {
  fetch(alt_12_dict)
    .then((res) => res.text())
    .then((res) => {
      const indexed_dict = make_hashmap_2(res);
      const game_sets = main(indexed_dict, 3);
      console.log(game_sets.length);
      display_set_as_table(game_sets.slice(100, 200));
    })
    .catch((err) => {
      console.log(err);
    });
}

function make_hashmap(dict, splitter = ' ') {
  const x = {};
  const lines = dict.split(splitter);
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

function make_hashmap_2(dict, splitter = '\n') {
  const x = {};
  const lines = dict.split(splitter);
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

function get_sub_words(x: string) {
  const result = [];
  const len = x.length;
  for (let i = 0; i < len; ++i) {
    result.push(remove_char_at_index(x, i));
  }
  return result.filter((el, index, arr) => arr.indexOf(el) === index);
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

function main(indexed_dict, min_len) {
  const starters = Object.keys(indexed_dict).filter((x) => x.length === 7);
  let result = [];
  while (starters.length > 0) {
    let curr = starters.pop();
    let game_set = [...indexed_dict[curr]];
    // check all variants of curr minus one char at each index
    let stack = [];
    stack.push(...get_sub_words(curr));
    while (stack.length > 0) {
      let node = stack.pop();
      if (indexed_dict[node]) {
        // yes, keep going, save result
        game_set.push(...indexed_dict[node]);
        // push new ones to stack
        // if we're not already on the min length word
        if (node.length > min_len) {
          stack.push(...get_sub_words(node));
        }
      }
    }

    if (game_set[game_set.length - 1].length === min_len) {
      const sorted_deduped = game_set
        .filter((x, i, arr) => arr.indexOf(x) === i)
        .sort((a, b) => b.length - a.length);
      result.push(sorted_deduped);
    }
  }
  return result;
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
  return result;
}

// const test_game_sets = main(hashmap, 3);
// display_set_as_table(test_game_sets);

// use whole dictionary
request_dict();

// render table of words
function display_set_as_table(game_sets) {
  const set_table_el = document.createElement('table');
  const set_thead_el = document.createElement('thead');
  const set_thead_tr_el = document.createElement('tr');
  const headers = ['id', 'words'];
  for (let i = 0; i < headers.length; ++i) {
    const th = document.createElement('th');
    th.innerHTML = headers[i];
    set_thead_tr_el.appendChild(th);
  }
  const set_tbody_el = document.createElement('tbody');

  let id = 1;
  for (const row of game_sets) {
    const set_tbody_tr_el = document.createElement('tr');
    const set_tbody_td_0_el = document.createElement('td');
    const set_tbody_td_1_el = document.createElement('td');
    set_tbody_td_0_el.innerHTML = '' + id;
    set_tbody_td_1_el.innerHTML = row.join('|');
    set_tbody_tr_el.appendChild(set_tbody_td_0_el);
    set_tbody_tr_el.appendChild(set_tbody_td_1_el);
    set_tbody_el.appendChild(set_tbody_tr_el);
    ++id;
  }

  set_thead_el.appendChild(set_thead_tr_el);
  set_table_el.appendChild(set_thead_el);
  set_table_el.appendChild(set_tbody_el);

  appDiv.appendChild(set_table_el);
}

// render columns of words
function display_set(game_set) {
  const set_table_el = document.createElement('table');
  const set_thead_el = document.createElement('thead');
  const set_thead_tr_el = document.createElement('tr');
  const cols = 5;
  for (let i = 0; i < cols; ++i) {
    const th = document.createElement('th');
    th.innerHTML = 7 - i + '-letter';
    set_thead_tr_el.appendChild(th);
  }
  const set_tbody_el = document.createElement('tbody');
  const body_cols = [game_set.root, ...game_set.children];
  // convert to rows
  const body_rows = convert_to_rows(body_cols);
  for (const row of body_rows) {
    const set_tbody_tr_el = document.createElement('tr');
    for (const col of row) {
      const set_tbody_td_el = document.createElement('td');
      set_tbody_td_el.innerHTML = typeof col !== 'undefined' ? col : '';
      set_tbody_tr_el.appendChild(set_tbody_td_el);
    }
    set_tbody_el.appendChild(set_tbody_tr_el);
  }

  set_thead_el.appendChild(set_thead_tr_el);
  set_table_el.appendChild(set_thead_el);
  set_table_el.appendChild(set_tbody_el);
  appDiv.appendChild(set_table_el);
}

function convert_to_rows(cols) {
  // rows should be
  const rows = [];
  for (let col = 0; col < cols.length; ++col) {
    const list = cols[col];
    // each index of list is a row
    for (let row = 0; row < list.length; ++row) {
      if (rows[row]) {
        rows[row][col] = list[row];
      } else {
        rows[row] = [];
        rows[row][col] = list[row];
      }
    }
  }
  return rows;
}
