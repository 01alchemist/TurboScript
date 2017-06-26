#pragma once

#include "arch.h"

export int   memcmp(const void *, const void *, size_t);
export void *memcpy(void *, const void *, size_t);
export void *memset(void *, int, size_t);

export void *mspace_init(void *);
export void *mspace_malloc(void *, size_t);
export void  mspace_free(void *, void *);
