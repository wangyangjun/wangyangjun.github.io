## Spring Unit Test Placeholder Property 
---
### Introduction
During creating unit tests for a class which has *autowired* property that owns placeholder property (*@Value*), we need mock this *autowired* property. The placeholder property should be provided as well.  

### Solutions

**Annotation**
  
```
@TestPropertySource(properties = { "business.id = 0000-000", "dta.port.detection.notification.period = 3",
        "dta.port.detection.rou.enabled = true", "dta.port.detection.rou.variable = port.detection",
        "dta.port.show.notification.variable = closed.notification" })

```
  
  
**PropertyPlaceholderConfigurer**

```
@Bean
public PropertyPlaceholderConfigurer propConfig() { // needed by spring
    PropertyPlaceholderConfigurer ppc = new PropertyPlaceholderConfigurer();
    ppc.setIgnoreResourceNotFound(true);
    return ppc;
}
```
