import DatabaseStructure from '../DatabaseStructure';

export default class CoreProvider {
  // const CURRENT_BASE_KEY = 'currentBaseConfig';
  // let _DatabaseStructure=new DatabaseStructure();
  // let database = null;
  // let connection = {};

  readonly databaseStructure: DatabaseStructure;

  readonly connection: any;

  constructor(connection: any) {
    this.connection = connection;
    this.databaseStructure = new DatabaseStructure();
    // connection.login
  }

  render() {
    //
    return 123;
  }

  setDatabase() {}

  getDatabase() {
    return 'default';
  }

  hashCode(s) {
    return s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  makeQueryId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  isAuthorized() {}

  getConnection() {
    return this.connection;
  }

  getPassword() {
    return this.connection.password;
  }

  getLogin() {
    return this.connection.login;
  }

  getHost() {
    return this.connection.host;
  }

  isTabixServer() {
    return false;
  }

  makeSqlQuery(sql, format) {
    let query = '';

    if (format !== false) {
      format = format || ' FoRmAt JSON';
      if (format == 'null') {
        format = '';
      }
      query = `${sql}\n\n${format}`;
    } else {
      query = sql;
    }
    return query;
  }

  /**
   * @param q
   * @param url
   * @returns {Promise<any>}
   */
  xhr(q, url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      url = `${url}&query=${q}`;
      xhr.open('GET', url, true);
      xhr.onload = function() {
        if (this.status >= 200 && this.status <= 300) {
          resolve(xhr.response);
        } else {
          reject(`Status ${this.status} ${xhr.statusText}`);
        }
      };

      xhr.ontimeout = function() {
        reject('Timeout');
      };
      xhr.onerror = function() {
        console.warn(this);
        reject(`Status ${this.status} ${this.statusText}`);
      };
      xhr.timeout = 1000;
      xhr.send();
    });
  }

  /**
   * @param q
   * @returns {Promise<Response>}
   */
  request(q) {
    return fetch(q)
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (
          contentType.includes('text/tab-separated-values') &&
          response.status == 200 &&
          response.statusText.toLowerCase() == 'ok'
        ) {
          // if insert
          return 'OK';
        }
        if (
          contentType.includes('text/plain') &&
          response.status == 200 &&
          response.statusText.toLowerCase() == 'ok'
        ) {
          // if create table && drop table
          return 'OK';
        }
        if (
          contentType &&
          contentType.includes('application/json') &&
          response.status >= 200 &&
          response.status < 300
        ) {
          return Promise.resolve(response);
        }
        return response.text().then(Promise.reject.bind(Promise));
      })
      .then(
        response => {
          if (response === 'OK') {
            return 'OK';
          }
          return response.json();
        },
        responseBody => Promise.reject(responseBody)
      );
  }
}