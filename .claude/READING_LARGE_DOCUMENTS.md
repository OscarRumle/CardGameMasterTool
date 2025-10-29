# Reading Large Documents Without "Prompt Too Long" Errors

## The Challenge
When working with large PDFs, markdown files, or text documents in Project Knowledge, attempting to read the entire document at once can cause "Prompt is too long" errors that prevent successful reading.

## The Solution: Chunked Reading Strategy

### Using the Read Tool with Offset and Limit

The Read tool supports two key parameters for chunked reading:
- **`offset`**: The line number to start reading from
- **`limit`**: The number of lines to read from that offset

### Example: Reading a Large PDF in Chunks

```javascript
// Read first 100 lines (pages 1-X)
Read({
  file_path: "/path/to/large-document.pdf",
  offset: 0,
  limit: 100
})

// Read next 100 lines (continue from where we left off)
Read({
  file_path: "/path/to/large-document.pdf",
  offset: 100,
  limit: 100
})

// Read next chunk
Read({
  file_path: "/path/to/large-document.pdf",
  offset: 200,
  limit: 100
})
```

## Best Practices

### 1. **Start with a Preview**
Always read a small chunk first to understand the document structure:
```javascript
Read({ file_path: "/path/to/doc.pdf", offset: 0, limit: 50 })
```

### 2. **Read Only What You Need**
Don't read the entire document if you only need specific sections. Use strategic offsets:
- Introduction: offset 0, limit 50
- Middle section: offset 500, limit 100
- Conclusion: offset 1000, limit 50

### 3. **Progressive Reading**
Read incrementally as you discover what information you need:
1. Read first chunk to understand structure
2. Identify relevant sections
3. Read those specific sections with targeted offsets

### 4. **Search First, Then Read**
If looking for specific information:
1. Use Grep to search for keywords
2. Note the line numbers where matches occur
3. Use Read with offset to read around those line numbers

### 5. **Adaptive Chunk Sizes**
- **Dense technical docs**: Use smaller chunks (50-100 lines)
- **Narrative documents**: Can use larger chunks (100-200 lines)
- **Code files**: Smaller chunks for readability (50-100 lines)

## Practical Examples

### Example 1: Reading a 500-Page Rulebook
```javascript
// Get overview (first 50 lines)
Read({ file_path: "Rulebook.pdf", offset: 0, limit: 50 })

// Read combat rules section (discovered at line 150)
Read({ file_path: "Rulebook.pdf", offset: 150, limit: 100 })

// Read equipment section (discovered at line 350)
Read({ file_path: "Rulebook.pdf", offset: 350, limit: 80 })
```

### Example 2: Reading Multiple Hero Design Docs
Instead of reading all at once, read one hero at a time:
```javascript
// Read Mage design doc in chunks
Read({ file_path: "Design_Doc_-_Mage.pdf", offset: 0, limit: 100 })
// Process Mage info...

// Read Barbarian design doc in chunks
Read({ file_path: "Design_Doc_-_Barbarian.pdf", offset: 0, limit: 100 })
// Process Barbarian info...
```

### Example 3: Search-Driven Reading
```javascript
// First, search for "Ultimate" keyword
Grep({ pattern: "Ultimate", path: "Rulebook.pdf" })
// Result: Found at lines 245, 678, 892

// Read around those line numbers
Read({ file_path: "Rulebook.pdf", offset: 240, limit: 20 })
Read({ file_path: "Rulebook.pdf", offset: 673, limit: 20 })
```

## When Reading Your Project Knowledge

### Your Current Knowledge Docs:
- `/Knowledge Docs/Game Rules/Rulebook_Complete_Edition.pdf` (285.9KB)
- `/Knowledge Docs/Hero Design/Design_Doc_-_Mage.pdf`
- `/Knowledge Docs/Hero Design/Design_Doc_-_Necromancer.pdf`
- `/Knowledge Docs/Hero Design/Design_Doc_-_Rogue.pdf`
- `/Knowledge Docs/Hero Design/Design_Doc_-_Barbarian.pdf`

### Recommended Reading Strategy:

1. **For Quick Reference**: Read specific sections with small offsets
2. **For Deep Analysis**: Read in sequential chunks of 100 lines
3. **For Searching**: Use Grep first, then Read around matches
4. **For Comparisons**: Read same offset ranges from multiple docs

## Technical Details

### How PDFs Are Processed
- PDFs are converted to text/markdown format
- Each page becomes multiple "lines" in the text representation
- Page boundaries are preserved with page markers
- Images and visual content are described textually

### Optimal Chunk Sizes
- **50 lines**: Very focused reading, specific sections
- **100 lines**: Standard chunk size, good balance
- **200 lines**: Larger context, slower processing
- **500+ lines**: May cause "Prompt too long" errors

### Memory Considerations
Each Read operation consumes tokens in the conversation:
- Content tokens (the actual document text)
- Context tokens (conversation history)
- Response tokens (my analysis)

Reading in smaller chunks helps manage this token budget efficiently.

## Common Patterns

### Pattern 1: Table of Contents Approach
```javascript
// Read TOC to understand structure
Read({ offset: 0, limit: 30 })
// Identify section line numbers from TOC
// Read specific sections directly
```

### Pattern 2: Binary Search
```javascript
// Read beginning, middle, end to understand document
Read({ offset: 0, limit: 50 })
Read({ offset: 500, limit: 50 })
Read({ offset: 1000, limit: 50 })
// Then narrow down to relevant sections
```

### Pattern 3: Question-Driven
```javascript
// User asks: "What are the combat rules?"
// Search for "combat"
Grep({ pattern: "combat", output_mode: "content", "-n": true })
// Read around the line numbers returned
```

## Summary

**Key Takeaway**: Never try to read an entire large document at once. Always use the `offset` and `limit` parameters to read strategically in manageable chunks.

This approach:
- ✅ Avoids "Prompt too long" errors
- ✅ Reduces token consumption
- ✅ Enables focused, efficient reading
- ✅ Allows progressive understanding
- ✅ Supports iterative exploration

**Remember**: I can read ANY size document in your Project Knowledge as long as I read it in appropriate chunks!
