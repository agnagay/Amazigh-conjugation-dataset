## Amazigh Verbs Conjugation Dataset

This README.md file provides essential information about the **Moroccan tamazight verbs Conjugation Dataset**, which contains conjugations for 3000+ Amazigh verbs. The dataset is structured in JSON format, allowing easy access and manipulation for linguistic research and development purposes.

### Dataset Overview

- **Dataset Name**: Moroccan tamazight Verbs Conjugation Dataset
- **Total Verbs**: 3000+
- **File Format**: JSON
- **Languages Included**:
  - Amazigh language (Tamazight)
  - Arabic
  - French
  - English
- **Data Source**: 
  - [Le Centre de l'aménagement linguistiqueL](https://biblio.ircam.ma/pmb/catalogue/index.php?lvl=author_see&id=3927) "[Manuel de conjugaison amazighe](https://biblio.ircam.ma/pmb/catalogue/index.php?lvl=notice_display&id=13163)", 2012, Institut Royal de la Culture Amazighe .
  - [IRCAM conjugator](https://tal2.ircam.ma/conjugueur/conjugappl.php).
  - [المعجم العربي الأمازيغي، محمد شفيق](https://archive.org/details/mujam-ar-amazigy-01/Mujam_Ar_Amazigy_01/)
  
### JSON Structure

Each verb entry in the dataset is structured as follows:

```json
{
    "lemma": "ⴰⴳⴳⵯⵊ",
    "ConjugationForm": "default",
    "ao": {
        "s1": {
            "m": "ⴰⴳⴳⵯⵊⵖ",
            "f": "ⴰⴳⴳⵯⵊⵖ"
        },
        "s2": {
            "m": "ⵜⴰⴳⴳⵯⵊⴷ",
            "f": "ⵜⴰⴳⴳⵯⵊⴷ"
        },
        // Additional singular and plural forms
    }
    // Additional sections for various conjugations
}
```

#### Attributes

- **lemma**: The base form of the verb in Amazigh script.
- **ar**: The Arabic translation of the verb.
- **fr**: The French translation, represented as a key-value pair to accommodate multiple translations.
- **en**: The English translation, represented similarly to French.
- **ConjugationForm**: Indicates the form of the conjugation (e.g., default, first, second).

### Conjugation Forms

The dataset includes multiple conjugation forms categorized as follows:

- **ao** (Aoriste form)
- **acc** (positive perfective)
- **accn** (negative perfective)
- **inacc** (imperfective)
- **imp** (imperative)
- **impi** (intensive imperative)

Each form includes singular (s) and plural (p) configurations for both masculine (m) and feminine (f) genders.

### Installation

To download the dataset, clone this repository using the following command:

```bash
git clone https://github.com/username/Amazigh-conjugation-dataset.git
```
You can access the dataset in the `data` directory:

```bash
cd Amazigh-conjugation-dataset/data
```

### Usage

The dataset can be used in various applications, including:

- Natural language processing (NLP)
- Linguistic research
- Language learning applications
- Integration into language modeling utilities

## Citation

If you use this dataset in your research or project, please cite:

Y. Ait Ouguengay. (2026). Amazigh Verb Conjugation Dataset. GitHub. https://github.com/agnagay/amazigh-conjugation-dataset

Or see the [CITATION.cff](CITATION.cff) file for other citation formats.

### Contributions

Contributions are welcome! Please adhere to the following guidelines:

1. **Fork** the repository.
2. Create a branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

### License

This dataset is licensed under the Creative Commons Attribution 4.0 Internnational License. See the [LICENSE.md](LICENSE.md) file for details.
