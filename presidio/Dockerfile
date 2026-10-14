# Imagen oficial de Presidio Analyzer configurada para español.
# No contiene código propio: solo ficheros YAML y el modelo spaCy en español.
FROM mcr.microsoft.com/presidio-analyzer:2.2.362

# es_core_news_md (~40 MB) por defecto; es_core_news_lg (~550 MB) es más preciso.
# Si se cambia, actualizar también conf/nlp.yaml.
ARG SPACY_MODEL=es_core_news_md

USER root
RUN poetry run python -m spacy download ${SPACY_MODEL}

COPY conf/ /app/conf/
ENV NLP_CONF_FILE=conf/nlp.yaml \
    ANALYZER_CONF_FILE=conf/analyzer.yaml \
    RECOGNIZER_REGISTRY_CONF_FILE=conf/recognizers.yaml

USER 1001
