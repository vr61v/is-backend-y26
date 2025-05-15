import { MigrationInterface, QueryRunner } from "typeorm";

export class FillServicesTable1740394719392 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO services (name_value, name, description, price, is_rent) VALUES 
    ('standardRent', 'Аренда студии', 'Стандартная аренда студии', 5000, true),
    ('proRent', 'Аренда студии с Профи', 'Аренда студии с дополнительными услугами Профи', 8000, true),
    ('mixing', 'Сведение', 'Сведение аудио материалов', 500, false),
    ('design', 'Графический дизайн', 'Дизайн для альбомов или рекламных материалов', 700, false),
    ('mastering', 'Технический монтаж / мастеринг', 'Финальная обработка и мастеринг треков', 800, false),
    ('ghostwriter', 'Гострайт / Написание текста', 'Написание текстов для песен или стихов', 1000, false),
    ('instrumental', 'Инструментал / Создание аранжировок', 'Создание музыкальных аранжировок', 1200, false),
    ('song-for-key', 'Песня под ключ', 'Создание и запись песни с нуля до готового продукта', 1500, false)
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM services WHERE nameValue IN
        ('standardRent', 'proRent', 'mixing', 'design', 'mastering', 'ghostwriter', 'instrumental', 'song-for-key')
    `);
  }
}
