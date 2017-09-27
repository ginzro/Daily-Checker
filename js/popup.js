(function() {
  'use strict'

  var task_container = document.getElementById('task_container');
  var calendar = document.getElementById('calendar');
  var add_task = document.getElementById('add_task');
  var this_month_contain = document.getElementById('this_month_contain');
  var this_day = document.getElementById('this_day');
  var previous_month = document.getElementById('previous_month');
  var next_month = document.getElementById('next_month');
  var task_scroll = document.getElementById('task_scroll');
  var month_count = 0;
  var year_count = 0;


  function createTask(task_value, wehther_done = 'cards') {// default値 = task内のtextContent, cardsclass名
    /* cardsclassのdivを作成 */
    var container_cards;
    container_cards = createDiv(wehther_done);
    /* done_cardを作成 */
    var inner_done_card;
    inner_done_card = createDiv('done_card');
    inner_done_card.textContent = 'Done!';
    /* task_divを作成 */
    var inner_task;
    inner_task = createDiv('task');
    /* 内部のinputを作成 */
    var inner_input_div;
    if (task_value) {// 引数があるか否かで場合分け
      inner_input_div = createDiv('input_div');
      inner_input_div.innerHTML = task_value;
    } else {
      inner_input_div = createInput('習慣にしたい目標');
    }
    /* removeボタンをdivで作成 */
    var inner_rm_button;
    inner_rm_button = createDiv('rm_btn');
    inner_rm_button.innerHTML = '<img src="img/remove.png" alt="RM" width="14px" height="14px">';
    /* editボタンをdivで作成 */
    var inner_edit_button;
    if (task_value) {// 引数があるか否かで場合分け
      inner_edit_button = createDiv('edit_button eddited');
    } else {
      inner_edit_button = createDiv('edit_button');
    }
    inner_edit_button.innerHTML = '<img src="img/edit.png" alt="EDIT" width="14px" height="14px">';
    /* 作成したdivをtask_containerに追加 */
    task_container.appendChild(container_cards);
    container_cards.appendChild(inner_task);
    container_cards.appendChild(inner_done_card);
    inner_task.appendChild(inner_edit_button);
    inner_task.appendChild(inner_input_div);
    inner_task.appendChild(inner_rm_button);

    /* イベント属性の付与 */
    AddEventTaskDone(container_cards);
    addEventEditBtn(inner_edit_button);
    addEventRemoveBtn(inner_rm_button);
  }
  function createDiv(class_name) {
    var createdElement = document.createElement('div');
    createdElement.className = class_name;
    return createdElement;
  }
  function createInput(input_value) {
    /* 内部のinputを作成 */
    var inner_input;
    var inner_input_div;
    inner_input_div = document.createElement('div');
    inner_input_div.className = 'input_div';
    inner_input = document.createElement('input');
    inner_input.type = 'text';
    inner_input.className = 'input_task';
    inner_input.onclick = function() {
      this.select();
    };
    inner_input.setAttribute('maxlength', '17');
    inner_input.value = input_value;
    inner_input_div.appendChild(inner_input);
    innerTextChangeSave(inner_input);//onchangeを付与
    return inner_input_div;
  }

  function innerTextChangeSave(e) {//inputtagにonchangeを付与
      e.addEventListener('change', function() {
        this.parentNode.insertAdjacentHTML('afterbegin', this.value);
        this.parentNode.previousElementSibling.className = 'edit_button eddited';//editボタンのclassを変更
        this.remove();
      });
  }

  function AddEventTaskDone(e) {
    e.addEventListener('dblclick', function() {
      if (this.firstChild.childNodes[1].innerHTML === '<input type="text" class="input_task" maxlength="17">') {
        return;// innerHTLMの編集が完了していない場合の処理を停止
      }
      if(this.className === 'cards move') {
        this.className = 'cards'

      } else {
      this.className = 'cards move';
      }
      saveSync();
      var date = new Date();
      var this_month = date.getMonth();
      console.log(this_month);
      var calendar_month_id = document.getElementById('this_month');
      var calendar_month = calendar_month_id.innerHTML - 1
      console.log(calendar_month);
      if (this_month === calendar_month) {// 現在の月以外はcalendar変換を行わない
        changeCalendar(month_count);
      }
    });
  }
  function addEventEditBtn(e) {
    e.addEventListener('click', function() {
      if(this.className === 'edit_button eddited') {
        var input_div_text = this.parentNode.childNodes[1].textContent;// div内のtextcontentを取得
        this.parentNode.childNodes[1].remove();// div要素を削除
        this.parentNode.insertBefore(createInput(input_div_text), this.parentNode.childNodes[1]);// 削除ボタンの前にinputdivを挿入
        this.className = 'edit_button';
      } else {
        var value_text = this.parentNode.childNodes[1].childNodes[0].value;// inputのvalueを取得
        this.parentNode.childNodes[1].childNodes[0].remove();// inputを削除
        this.parentNode.childNodes[1].innerHTML = value_text;// input_div内にvalue_textを挿入
        this.className = 'edit_button eddited';// inputにonchangeを付け直し
        saveSync();
      }
    });
  }
  function addEventRemoveBtn(e) {
    e.addEventListener('click', function() {
      this.parentNode.parentNode.remove();
      saveSync();
    });
  }
  function calculateNextReset(reset_time = 3) {
    var date_next_3 = new Date();
    var date_now = new Date();
    if (date_next_3.getHours() >= reset_time) {
      date_next_3.setDate(date_next_3.getDate() + 1);
    }
    date_next_3.setHours(reset_time);
    date_next_3.setMinutes(0);
    date_next_3.setSeconds(0);
    return date_next_3.getTime() - date_now.getTime();
  }

  function loadSync() {
    chrome.storage.sync.get(["isused", "remaining_time", "end_time", "task_value", "wehther_done"], function (items) {
      if (items.isused) {
        // 時刻がreset_timeを回ったか判断する
        var date = new Date();
        var end_time = Date.parse(items.end_time);// 終了時刻のミリ秒
        var barance_time = date.getTime() - end_time;// 終了時刻からの経過時間
        if (items.remaining_time < barance_time) {// reset_timeを過ぎたか判断
          for (var i = 0; i < items.task_value.length; i++) {
            createTask(items.task_value[i]);
          }
          // console.log('reset_timeを過ぎました');
        } else {
          for (var i = 0; i < items.task_value.length; i++) {
            createTask(items.task_value[i], items.wehther_done[i]);
          }
          // console.log('reset_timeまでまだあります');
        }
        changeCalendar();
        console.log('load!');
      } else {
        createTask();
        createTask('ダブルクリックで完了します');
        createTask('タスクはAM3:00にリセットされます');
        createTask('タスクはスクロール可能です');
        createCalendar();
        var init_setting = {"done_record": {}};// 最初に空配列を作成していないと初回読み込みでerrorを吐く
        chrome.storage.sync.set(init_setting, function () {
      });
        console.log('welcome');
      }
    });
  }
  function saveSync() {
    chrome.storage.sync.get("done_record", function (items) {
      // 終了時刻を確認
      var remaining_time = calculateNextReset();
      var end_time = new Date();
      // タスク内容をarrayに格納
      var task_value_array = [];
      var input_divs = document.getElementsByClassName('input_div');
      for (var i = 0; i < input_divs.length; i++) {
        task_value_array[i] = input_divs[i].textContent;
      }
      // タスクが終わっているか保存
      var cards = document.getElementsByClassName('cards');
      var whether_done_array = [];
      for (var i = 0; i < cards.length; i++) {
        whether_done_array[i] = cards[i].className;
      }
      // 今月のデータを保存
      var this_month_key = end_time.getFullYear() + '-' + end_time.getMonth();
      var done_record_array = new Object();

      if (items.done_record) {
        done_record_array = items.done_record;
        console.log(done_record_array);
        done_record_array[this_month_key] = createMonthRecoad(0, done_record_array[this_month_key]);
        console.log(done_record_array[this_month_key]);
      } else {
        done_record_array = {this_month_key: createMonthRecoad()};
      }

      var setting = {
        "isused": true,// 使用したかを記録
        "remaining_time": remaining_time,
        "end_time": end_time.toISOString(),
        "task_value": task_value_array,
        "done_record": done_record_array,
        "wehther_done": whether_done_array
      };
        chrome.storage.sync.set(setting, function () {
        console.log(done_record_array);
        console.log(this_month_key);
        console.log('save!');
      });
    });
  }
  function addEventTdMouseover(tdsElement, task_done_record, num) {
    // task_done_record[i].やったタスクを表示する処理を書く
    tdsElement.addEventListener('mouseover', function() {
      var task_value_containeres = document.getElementById('task_value_container');
      var element = document.createElement('div');
      var popup_text = '完了したタスク<br>';

      for (var j = 0; j < task_done_record.length; j++) {
        popup_text += '-' + task_done_record[j] + '-<br>';
      }
      element.innerHTML += popup_text;
      element.className = 'popup_task';
      element.id = num + 'td';
      task_value_containeres.appendChild(element);
    });
    tdsElement.addEventListener('mouseout', function() {
      var td_div = document.getElementById(num + 'td');
      td_div.remove();
    });
  }
  function calendarChangeClass(task_done_record, month_cont = 0) {
    if (!task_done_record) {
      return;
    }
    var tds = document.getElementsByClassName('ca_td');
    var date = new Date();
    date.setMonth(date.getMonth() + month_count);//作成する月に時間をセット
    date.setDate(1);
    var previous_month_day = date.getDay();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    var final_day = date.getDate();
    var tdsnode_num = previous_month_day;

    for (var i = 0; i < task_done_record.length; i++) {

      if (task_done_record[i]) {
        tds[tdsnode_num].className = 'ca_td done';
        addEventTdMouseover(tds[tdsnode_num], task_done_record[i], i);

      } else {
        tds[tdsnode_num].className = 'ca_td';
      }
      tdsnode_num++;
    }

  }
  function changeMonthRecord(month_count = 0) {
    chrome.storage.sync.get("done_record",function (items) {
      console.log(items.done_record);
      var date = new Date();
      var now_date = new Date();
      date.setMonth(date.getMonth() + month_count);//作成する月に時間をセット
      var yymm = date.getFullYear() + '-' + date.getMonth();
      if (items.done_record[yymm]) {
        var this_month_array = items.done_record[yymm];
      } else {
        var this_month_array = [];
      }

      /*
      1新しく今月のMonthRecordを作る場合(カレンダーデータが無いが今月である)
      2既存のものを利用して変えない場合(今月ではないカレンダー)
      3今日の変更を加える場合(データが存在してかつ今月である場合)
      */
      if (now_date.getMonth() === date.getMonth()) {//表示する月が今月か否かCheck
        if (!this_month_array) {//1新しく今月のMonthRecordを作る場合
          var tds = document.getElementsByClassName('ca_td');
          for (var i = 0; i < tds.length; i++) {
            tds[i].className = 'ca_td';
          }
          this_month_array = createMonthRecoad();
        } else {//3今日の変更を加える場合(データが存在してかつ今月である場合)
          this_month_array = createMonthRecoad(month_count, this_month_array);
        }
      }

      calendarChangeClass(this_month_array, month_count);
    });
  }
  function createMonthRecoad(month_count = 0, this_month_racord = new Object()) {
      var date = new Date();
      date.setMonth(date.getMonth() + month_count);//作成する月に時間をセット
      var now_yymm = date.getFullYear() + '-' + date.getMonth();
      var today = date.getDate() - 1;//配列を取り出す時のために一日引く
      var done_tasks = document.getElementsByClassName('move');
      var done_tasks_value = [];
      var this_month_array = new Array();

      date.setMonth(date.getMonth() + 2);//最終日を取得 setMonth時は0~11で考えず1~12でsetする
      date.setDate(0);
      var day_length = date.getDate() - 1;

      for (var i = 0; i < day_length; i++) {
        if (i !== today) {
          if (this_month_racord[i]) {
            this_month_array[i] = this_month_racord[i];
          } else {
            this_month_array[i] = '';
          }
        } else {
          if (done_tasks.length !== 0) {
            for (var j = 0; j < done_tasks.length; j++) {
              done_tasks_value[j] = done_tasks[j].firstChild.childNodes[1].innerHTML;
            }
            this_month_array[i] = done_tasks_value;
          } else if (done_tasks.length === 0) {
            this_month_array[i] = '';
            // console.log('完了したタスクはないよ');
          }
        }
      }
      return this_month_array;
  }
  function createCalendar(month_count = 0) {//引数は月移動の際に使用する
    var date = new Date();
    var month_day_length = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    date.setMonth(date.getMonth() + month_count);//作成する月に時間をセット

    var year = date.getFullYear();
    var month = date.getMonth();//月(0~11)
    var week = date.getDay();
    var today = date.getDate();

    if (((year%4)==0 && (year%100)!=0) || (year%400)==0){// 閏年の判断
      month_day_length[1] = 29;
    }

    date.setDate(1);
    var first_week_day = date.getDay();
    var table_line_num = Math.ceil((first_week_day + month_day_length[month]) / 7);//0と31日を足すとカレンダーテーブルの総マス数これを７で割って切り上げると行数
    var table_array = [];
    const TABLE_LINE_LENGTH = 7 * table_line_num;

    for (var i = 0; i < TABLE_LINE_LENGTH; i++) {
      table_array[i] = "";
    }
    for (var i = 0; i < month_day_length[month]; i++) {
      table_array[first_week_day + i] = i + 1;// table_arryに日付を挿入
    }
    /* カレンダーの要素を実際に作成 */
    var calendar_table = document.createElement('table');
    var calendar_tbody = document.createElement('tbody');
    for (var i = 0; i < table_line_num; i++) {
      var calendar_tr = document.createElement('tr');
      for (var j = 0; j < 7; j++) {
        var this_day = table_array[j + (i * 7)];
        var calendar_td = document.createElement('td');
        calendar_td.className = 'ca_td';
        calendar_td.innerHTML = this_day;
        calendar_tr.appendChild(calendar_td);// tr要素に１週間分のtdを追加
      }
      calendar_tbody.appendChild(calendar_tr);
    }
    calendar_table.appendChild(calendar_tbody);
    calendar.appendChild(calendar_table);

    var this_month = document.getElementById('this_month');
    var this_year = document.getElementById('this_year');

    this_month.innerHTML = month + 1;
    this_year.innerHTML = year;
  }
  function changeCalendar(month_count = 0) {
    while(calendar.firstChild) {// calendar内を削除
      calendar.removeChild(calendar.firstChild);
    }
    createCalendar(month_count);
    changeMonthRecord(month_count);
  }
  /* 初期ContantsにEvent属性を付与 */
  add_task.addEventListener('click', function() {// addボタンにaddEventListenerを付与
    createTask();
    task_scroll.scrollTop = task_scroll.scrollHeight;// タスク下部までスクロール
  });
  next_month.addEventListener('click', function() {
    month_count++;
    changeCalendar(month_count);
  });
  previous_month.addEventListener('click', function() {
    month_count--;
    changeCalendar(month_count);
  });
  this_month_contain.addEventListener('click', function() {
    month_count = 0;
    changeCalendar(month_count);
  })
  // chrome.storage.sync.clear(function () {});//デバッグ用
  // init 処理
  loadSync();
})();
