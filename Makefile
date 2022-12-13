IGNORE = --ignore=build,public,docs,README.md
CONFIG = --config tsconfig.json
OUT_DIR = build

run:
	deno run --allow-net --watch --allow-env http.ts $(CONFIG)

fmt:
	deno fmt $(IGNORE) --unstable

check:
	deno fmt --check $(IGNORE) --unstable

lint:
	deno lint --unstable $(IGNORE)

clean:
	rm -rf $(OUT_DIR)