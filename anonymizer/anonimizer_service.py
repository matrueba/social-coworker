from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

nlp = NlpEngineProvider(nlp_configuration={
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "es", "model_name": "es_core_news_lg"}],
}).create_engine()
analyzer = AnalyzerEngine(nlp_engine=nlp, supported_languages=["es"])

analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="TELEFONO", supported_language="es",
    patterns=[Pattern("tel_es", r"(?:\+34|0034)?[\s-]?[6789]\d{2}[\s-]?\d{3}[\s-]?\d{3}", 0.7)],
    context=["teléfono", "tlf", "móvil", "llamar"],
))

def pseudoanonymizer(text, record):
    table = {}

    ad_hoc = []
    for rol in set(record.values()):
        variants = [n for n, r in record.items() if r == rol]
        ad_hoc.append(PatternRecognizer(supported_entity=rol,
                                        supported_language="es", deny_list=variants))

    results= analyzer.analyze(text=text, language="es",
                                  ad_hoc_recognizers=ad_hoc, score_threshold=0.4)

    def labeler(typo):
        def op(value):
            if value not in table:
                if typo in set(record.values()):
                    table[value] = f"[{typo}]"
                else:
                    n = sum(1 for e in table.values() if e.startswith(f"[{typo}_")) + 1
                    table[value] = f"[{typo}_{n}]"
            return table[value]
        return op

    types = {r.entity_type for r in results}
    operators = {t: OperatorConfig("custom", {"lambda": labeler(t)}) for t in types}
    output = AnonymizerEngine().anonymize(text=text, analyzer_results=results,
                                          operators=operators)
    return output.text, table

def reidentify(report, table):
    for original, label in table.items():
        report = report.replace(label, original)
    return report