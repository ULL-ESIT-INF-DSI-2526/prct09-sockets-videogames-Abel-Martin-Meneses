import request from 'request';
import { AuthorInfo, WorkInfo } from './interfaces.js';

const authorInfo = (name: string, callback: (err: string | undefined, data: AuthorInfo | undefined) => void) => {
  const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`;
  request({ url: url, json: true}, (error: Error, response) => {
    if (error) {
      callback(`Openlibrary API is not available: ${error.message}`, undefined);
    } else if (response.body.numFound === 0) {
      callback(`Openlibrary API error: no author found`, undefined);
    } else {
      const author = response.body.docs[0];
      const key: string = author.key;
      const birth_date: string = author.birth_date || undefined;
      const top_subjects: string[] = author.top_subjects || [];

      const data: AuthorInfo = {
        name: name,
        key: key,
        birth_date: birth_date,
        top_subjects: top_subjects
      }

      callback(undefined, data);
    }
  })
}

const works = (key: string, limit: number, callback: (err: string | undefined, data: WorkInfo[] | undefined) => void) => {
  const url = `https://openlibrary.org/authors/${key}/works.json`;
  request({ url: url, json: true}, (error: Error, response) => {
    if (error) {
      callback(`Openlibrary API is not available: ${error.message}`, undefined);
    } else if (response.body.error) {
      callback(`Openlibrary API error: works not found`, undefined);
    } else {
      const firstWorks = response.body.entries.slice(0, limit);

      const worksData: WorkInfo[] = firstWorks.map((work: any) => {
        return {
          title: work.title,
          created: work.created ? work.created.value : undefined,
          subjects: work.subjects ? work.subjects.join(', ') : undefined
        }
      })

      callback(undefined, worksData);
    }
  })
}

if (process.argv.length != 4) {
  console.log('Debe llamar al programa con dos argumentos, nombre del autor y número de obras a procesar');
  process.exit(1);
}

const name: string = process.argv[2];
const works_num: number = parseInt(process.argv[3]);

authorInfo(name, (authorErr, authorData) => {
  if (authorErr) {
    return console.log(authorErr);
  } else if (authorData) {
    console.log('\n--- INFORMACIÓN DEL AUTOR/A ---');
    console.log(`Nombre:          ${authorData.name}`);
    console.log(`Año nacimiento:  ${authorData.birth_date}`);
    console.log(`Temas principales:    ${authorData.top_subjects.join(', ') || 'Ninguno registrado'}`);
    
    console.log(`\nBuscando sus primeras ${works_num} obras...\n`);
    works(authorData.key, works_num, (errorWorks, worksData) => {
      if (errorWorks) {
        return console.error(errorWorks);
      }

      if (worksData) {
        const tablaObras = worksData.map((obra) => {
          return {
            'Título': obra.title,
            'Fecha Creación API': obra.created,
            'Temáticas': obra.subjects
          };
        });

        console.table(tablaObras);
      }
    });
  }
})